import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { type Plugin, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * Agrega una Content Security Policy estricta al HTML final.
 * En NeonType.html solo se permiten el script y el estilo incrustados (por su hash SHA-256). En la web, los archivos
 * del mismo sitio ('self'). Cualquier otro código queda bloqueado y toda conexión está prohibida.
 */
function contentSecurityPolicy(web: boolean): Plugin {
  const sha = (s: string) => `'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`;
  return {
    name: "neo-csp",
    apply: "build",
    enforce: "post",
    // se aplica sobre el archivo ya escrito, cuando el JS y el CSS ya están incrustados
    closeBundle() {
      const file = resolve(__dirname, web ? "dist-web/index.html" : "dist/index.html");
      let src = readFileSync(file, "utf8");
      // solo cuentan las etiquetas reales (no el texto que hay dentro del JS)
      const tags = src.replace(/(<script\b[^>]*>)[\s\S]*?<\/script[^>]*>/gi, "$1</script>");
      if (web && /<script\b(?![^>]*\bsrc=)[^>]*>|<style\b/i.test(tags)) throw new Error("CSP: en la web no tiene que haber script ni estilo incrustado");
      // Dentro de un <script> incrustado, las secuencias "<!--" y "<script" cambian cómo el
      // navegador busca el cierre (estado "script data escaped"): si aparecen las dos, el
      // </script> real deja de cerrar el elemento. Los ejercicios de HTML las contienen como
      // texto, así que se escapan como \x3C (mismo valor en cualquier string o regex de JS).
      src = src.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g, (_, open: string, body: string, close: string) =>
        open + body.replace(/<(!--|script)/gi, "\\x3C$1") + close,
      );
      const scripts = [...src.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => sha(m[1]));
      const styles = [...src.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => sha(m[1]));
      if (!web && /<script\b[^>]*\bsrc=/.test(tags)) throw new Error("CSP: se esperaba que todos los scripts estén incrustados");
      const policy = [
        "default-src 'none'",
        `script-src ${web ? "'self'" : scripts.join(" ")}`,
        `style-src ${web ? "'self'" : styles.join(" ")}`,
        `img-src ${web ? "'self' " : ""}data: blob:`,
        `font-src ${web ? "'self'" : "data:"}`,
        "media-src blob:",
        "connect-src 'none'",
        `worker-src ${web ? "'self'" : "'none'"}`,
        "object-src 'none'",
        "frame-src 'none'",
        `manifest-src ${web ? "'self'" : "'none'"}`,
        "base-uri 'none'",
        "form-action 'none'",
        "require-trusted-types-for 'script'",
        `trusted-types ${web ? "neo-sw" : "'none'"}`,
      ].join("; ");
      const meta =
        `<meta http-equiv="Content-Security-Policy" content="${policy}">\n` +
        `<meta name="referrer" content="no-referrer">\n`;
      src = src.replace(/<head>/i, `<head>\n${meta}`);
      writeFileSync(file, src);
      if (web) sinInternet();
    },
  };
}

const ICONO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#050b14"/><path d="M7 10l6 6-6 6" stroke="#19d3ff" stroke-width="3" fill="none"/><path d="M16 23h9" stroke="#19d3ff" stroke-width="3"/></svg>\n`;

/**
 * Web instalable y sin internet: manifest, ícono y un service worker propio que guarda todos los archivos del build.
 * El nombre de la caché cambia con el contenido: cada build nuevo se instala aparte y espera a que la persona
 * toque Actualizar (src/web.ts). Nunca toca localStorage, así que el progreso no se pierde al actualizar.
 */
function sinInternet() {
  const dir = resolve(__dirname, "dist-web");
  writeFileSync(join(dir, "icono.svg"), ICONO);
  const manifest = {
    name: "N.E.O.-type", short_name: "N.E.O.-type", description: "Mecanografía para programadores.", lang: "es",
    start_url: "./", scope: "./", display: "standalone", background_color: "#050b14", theme_color: "#050b14",
    icons: [{ src: "icono.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
  writeFileSync(join(dir, "manifest.webmanifest"), JSON.stringify(manifest, null, 2) + "\n");
  const todos = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? todos(join(d, e.name)) : [join(d, e.name)]));
  const archivos = todos(dir).map((f) => relative(dir, f).split("\\").join("/")).filter((f) => f !== "sw.js").sort();
  const huella = createHash("sha256");
  for (const f of archivos) huella.update(f).update(readFileSync(join(dir, f)));
  const cache = `neo-${pkg.version}-${huella.digest("hex").slice(0, 12)}`;
  writeFileSync(join(dir, "sw.js"), `// Generado por vite.config.ts. Guarda la app para usarla sin internet.
const CACHE = ${JSON.stringify(cache)};
const ARCHIVOS = ${JSON.stringify(["./", ...archivos])};
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS))));
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("neo-") && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()),
));
// la versión nueva espera hasta que la persona toca Actualizar
self.addEventListener("message", (e) => { if (e.data === "actualizar") self.skipWaiting(); });
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then((c) => c.match(e.request, { ignoreSearch: true })).then((r) => r || fetch(e.request)));
});
`);
}

// Dos builds del mismo código. El de siempre genera un único index.html autocontenido (JS, CSS y fuentes
// incrustados) que se abre con doble clic, sin servidor ni internet. Con --mode web sale la web en varios
// archivos (dist-web/): cada tema de la Biblioteca es un pedazo aparte que se baja al abrirlo.
const pkg = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf8")) as { version: string };

export default defineConfig(({ mode }) => {
  const web = mode === "web";
  return {
    define: { __APP_VERSION__: JSON.stringify(pkg.version) },
    base: "./",
    plugins: [
      react(),
      ...(web ? [] : [viteSingleFile()]),
      contentSecurityPolicy(web),
      ...(web
        ? [{
            name: "neo-manifest",
            transformIndexHtml: () => [
              { tag: "link", attrs: { rel: "manifest", href: "./manifest.webmanifest" }, injectTo: "head" as const },
              { tag: "meta", attrs: { name: "theme-color", content: "#050b14" }, injectTo: "head" as const },
            ],
          }]
        : []),
    ],
    build: web
      ? { outDir: "dist-web", chunkSizeWarningLimit: 1_200 }
      : { assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 5_000 },
  };
});
