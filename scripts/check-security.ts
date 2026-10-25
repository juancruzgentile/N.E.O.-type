// Tests de seguridad: validación de datos importados y política CSP del build.
// Uso: npm run test:security (requiere haber corrido npm run build).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { MAX_AVATAR_CHARS, safeAvatar, sanitizeState } from "../src/sanitize";
import { initialState } from "../src/store";
import { LANGS } from "../src/data/curriculum";
import type { LangId } from "../src/types";

let failed = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) failed++;
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
};
const clean = (raw: unknown) => sanitizeState(raw, initialState(), (l: LangId) => LANGS[l].stages.length);

// ── validación de datos ──
const evil = JSON.parse(`{
  "version": 1,
  "__proto__": { "polluted": "yes" },
  "constructor": { "prototype": { "polluted2": "yes" } },
  "settings": {
    "userName": "Ana\\u202e<script>alert(1)</script>",
    "avatar": "img:https://evil.example/pixel.png",
    "theme": "\\"><script>",
    "targetWpm": 1e308, "minSamples": -5, "musicVolume": "NaN", "layout": "xx",
    "__proto__": { "pollutedS": "yes" }, "extra": 1
  },
  "lang": "cobol", "mode": "god",
  "profiles": {
    "__proto__": { "stage": 999 },
    "python:it": { "stage": 99999, "score": -1,
      "keys": { "(": { "n": 3, "ema": 1e99, "recent": "01<x>" }, "__proto__": { "n": 1 }, "ab": { "n": 1, "ema": 1 } },
      "lessons": [ { "wpm": "x" }, null, 5, { "ts": 1, "wpm": 40, "acc": 7, "kind": "hack" } ] },
    "../../etc:it": { "stage": 1 }
  },
  "days": { "2026-01-01": 1e12, "<x>": 5 },
  "achievements": { "hello": 1, "<b>": 2 }
}`);
const s = clean(evil);
const probe = {} as Record<string, unknown>;
ok(probe.polluted === undefined && probe.polluted2 === undefined && probe.pollutedS === undefined && probe.stage === undefined,
  "no hay contaminación de Object.prototype");
ok(!/[‮]/.test(s.settings.userName) && s.settings.userName.length <= 24, "el nombre se limpia de caracteres de control/dirección y se acota");
ok(s.settings.avatar === "", "se rechaza un avatar que apunta a una URL externa");
ok(s.settings.theme === "cyber" && s.settings.layout === "it", "tema y teclado inválidos vuelven al valor por defecto");
ok(s.settings.targetWpm === 90 && s.settings.minSamples === 5 && s.settings.musicVolume === 0.7, "los números se acotan a su rango");
ok(!("extra" in s.settings), "se descartan campos desconocidos");
ok(s.lang === null && s.mode === "guided", "lenguaje y modo inválidos se descartan");
ok(Object.keys(s.profiles).join() === "python:it", "solo se aceptan perfiles lenguaje:teclado válidos");
const p = s.profiles["python:it"];
ok(p.stage === LANGS.python.stages.length - 1 && p.score === 0, "nivel y puntaje se acotan");
ok(Object.keys(p.keys).join() === "(" && p.keys["("].recent === "" && p.keys["("].ema === 60_000, "estadísticas por tecla validadas");
ok(p.lessons.length === 1 && p.lessons[0].acc === 1 && p.lessons[0].kind === "code", "lecciones inválidas descartadas y valores acotados");
ok(Object.keys(s.days).join() === "2026-01-01" && s.days["2026-01-01"] === 86_400, "días validados");
ok(Object.keys(s.achievements).join() === "hello", "logros con claves válidas solamente");
ok(clean(null).version === 1 && clean("x").lang === null && clean([1, 2]).mode === "guided", "valores no-objeto producen un estado limpio");

// avatares
ok(safeAvatar("preset:robot") === "preset:robot", "avatar prediseñado aceptado");
ok(safeAvatar("img:data:image/jpeg;base64,AAAA") !== "", "imagen embebida aceptada");
ok(safeAvatar("img:data:image/svg+xml;base64,AAAA") === "", "se rechaza SVG embebido (puede contener scripts)");
ok(safeAvatar("img:javascript:alert(1)") === "", "se rechaza javascript:");
ok(safeAvatar("img:data:image/png;base64," + "A".repeat(MAX_AVATAR_CHARS)) === "", "se rechaza una imagen demasiado grande");

// ── Content Security Policy del build ──
let html = "";
try {
  html = readFileSync("dist/index.html", "utf8");
} catch {
  ok(false, "existe dist/index.html (correr npm run build antes)");
}
if (html) {
  const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/)?.[1] ?? "";
  ok(csp.length > 0, "el HTML tiene Content Security Policy");
  for (const d of ["default-src 'none'", "connect-src 'none'", "object-src 'none'", "base-uri 'none'", "form-action 'none'", "require-trusted-types-for 'script'"]) {
    ok(csp.includes(d), `CSP incluye ${d}`);
  }
  ok(!/unsafe-inline|unsafe-eval|https?:/.test(csp), "CSP sin unsafe-inline, unsafe-eval ni orígenes remotos");
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
  const hashes = scripts.map((m) => `'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`);
  ok(scripts.length >= 1 && hashes.every((h) => csp.includes(h)), "el hash del script coincide con la CSP");
  // las etiquetas reales, sin el contenido de los scripts (los ejercicios de HTML incluyen <script> como texto)
  const tags = html.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/g, "$1</script>");
  ok(!/<script\b[^>]*\bsrc=/.test(tags) && !/<link\b[^>]*\bhref="https?:/.test(tags), "no se cargan scripts ni estilos externos");
  ok(
    scripts.every((m) => !/<!--|<script/i.test(m[1])),
    "el JS incrustado no contiene <!-- ni <script (no puede alterar el cierre del elemento)",
  );
  ok(scripts.length === (html.match(/<\/script>/g) ?? []).length, "cada <script> tiene exactamente un cierre");
}

console.log(failed ? `\n${failed} test(s) fallaron` : "\nTodos los tests de seguridad pasaron");
process.exit(failed ? 1 : 0);
