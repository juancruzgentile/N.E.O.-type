import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { type Plugin, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * Agrega una Content Security Policy estricta al HTML final.
 * Solo se permiten el script y el estilo incrustados (por su hash SHA-256): cualquier
 * otro código queda bloqueado. La app no necesita red, así que toda conexión está prohibida.
 */
function contentSecurityPolicy(): Plugin {
  const sha = (s: string) => `'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`;
  return {
    name: "neo-csp",
    apply: "build",
    enforce: "post",
    // se aplica sobre el archivo ya escrito, cuando el JS y el CSS ya están incrustados
    closeBundle() {
      const file = resolve(__dirname, "dist/index.html");
      let src = readFileSync(file, "utf8");
      // Dentro de un <script> incrustado, las secuencias "<!--" y "<script" cambian cómo el
      // navegador busca el cierre (estado "script data escaped"): si aparecen las dos, el
      // </script> real deja de cerrar el elemento. Los ejercicios de HTML las contienen como
      // texto, así que se escapan como \x3C (mismo valor en cualquier string o regex de JS).
      src = src.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g, (_, open: string, body: string, close: string) =>
        open + body.replace(/<(!--|script)/gi, "\\x3C$1") + close,
      );
      const scripts = [...src.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => sha(m[1]));
      const styles = [...src.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => sha(m[1]));
      // solo cuentan las etiquetas reales (no el texto que hay dentro del JS)
      const tags = src.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/g, "$1</script>");
      if (/<script\b[^>]*\bsrc=/.test(tags)) throw new Error("CSP: se esperaba que todos los scripts estén incrustados");
      const policy = [
        "default-src 'none'",
        `script-src ${scripts.join(" ")}`,
        `style-src ${styles.join(" ")}`,
        "img-src data: blob:",
        "font-src data:",
        "media-src blob:",
        "connect-src 'none'",
        "worker-src 'none'",
        "object-src 'none'",
        "frame-src 'none'",
        "manifest-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
        "require-trusted-types-for 'script'",
        "trusted-types 'none'",
      ].join("; ");
      const meta =
        `<meta http-equiv="Content-Security-Policy" content="${policy}">\n` +
        `<meta name="referrer" content="no-referrer">\n`;
      src = src.replace(/<head>/i, `<head>\n${meta}`);
      writeFileSync(file, src);
    },
  };
}

// El build genera un único index.html autocontenido (JS, CSS y fuentes
// incrustados) que se abre con doble clic, sin servidor ni internet.
const pkg = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf8")) as { version: string };

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  base: "./",
  plugins: [react(), viteSingleFile(), contentSecurityPolicy()],
  build: {
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 5_000,
  },
});
