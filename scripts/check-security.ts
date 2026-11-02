// Tests de seguridad: validación de datos importados y política CSP del build.
// Uso: npm run test:security (requiere haber corrido npm run build).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { MAX_AVATAR_CHARS, safeAvatar, sanitizeState } from "../src/sanitize";
import { initialState } from "../src/store";
import { stageCount } from "../src/data/curriculum";
import type { LangId } from "../src/types";

let failed = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) failed++;
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
};
const clean = (raw: unknown) => sanitizeState(raw, initialState(), (l: LangId) => stageCount(l));

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
ok(p.stage === stageCount("python") - 1 && p.score === 0, "nivel y puntaje se acotan");
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

// ── rutas Trainee: escalones y ajustes nuevos ──
const evilTrack = clean(JSON.parse(`{
  "version": 1, "lang": "linux",
  "settings": { "distro": "windows", "dbEngine": "oracle" },
  "profiles": {
    "sql:it": { "stage": 999,
      "steps": {
        "__proto__": { "n": 1, "w": [1], "a": [1] },
        "sqlite": { "n": 3, "w": [30, "x", 1e9, -4, 50, 60, 70], "a": [1, 2, -1, 0.9] },
        "<x>": { "n": 1, "w": [1], "a": [1] },
        "mysql": { "n": "a", "w": [1], "a": [1] }
      } }
  }
}`));
const sp = evilTrack.profiles["sql:it"];
ok(evilTrack.lang === "linux", "acepta una ruta Trainee válida como lenguaje");
ok(evilTrack.settings.distro === "ubuntu" && evilTrack.settings.dbEngine === "sqlite", "distro y motor inválidos vuelven al valor por defecto");
ok(sp.stage === stageCount("sql") - 1, "el escalón se acota a los que existen");
ok(Object.keys(sp.steps).join(",") === "sqlite", "solo quedan escalones con id válido y datos numéricos");
ok(!Object.prototype.hasOwnProperty.call(sp.steps, "__proto__") && ({} as Record<string, unknown>).n === undefined, "los escalones no permiten contaminar prototipos");
const st = sp.steps.sqlite;
ok(st.w.length === st.a.length && st.w.length <= 5, "velocidad y precisión del escalón quedan alineadas y acotadas a 5");
ok(st.w.every((x) => x >= 0 && x <= 1000) && st.a.every((x) => x >= 0 && x <= 1), "los valores del escalón quedan dentro de rango");

// ── teclado aprendido ──
{
  const km = clean(JSON.parse(`{
    "version": 1,
    "settings": { "keymap": {
      "__proto__": { "x": 1 },
      "xx": { "{": { "code": "Digit7" } },
      "it": {
        "{": { "code": "Digit7", "shift": "yes", "altgr": true, "dead": 1 },
        "a": { "code": "KeyA" },
        "<b>": { "code": "Digit1" },
        "}": { "code": "javascript:alert(1)" },
        "__proto__": { "code": "Digit1" }
      }
    } }
  }`)).settings.keymap;
  ok(Object.keys(km).join(",") === "it", "teclado aprendido: solo distribuciones conocidas");
  ok(Object.keys(km.it ?? {}).join(",") === "{", "teclado aprendido: solo símbolos y teclas físicas válidas");
  ok(JSON.stringify(km.it?.["{"]) === '{"code":"Digit7","shift":false,"altgr":true}', "teclado aprendido: modificadores booleanos y sin campos extra");
}

// ── récords de proyectos ──
{
  const st = clean({
    version: 1,
    projects: {
      p01: { ms: 95_000, wpm: 40, acc: 0.98, ts: 1 },
      p02: { ms: 0, wpm: 9999, acc: 1, ts: 1 },
      p03: { ms: "rápido" },
      p04: "nada",
      "p05;alert(1)": { ms: 5000 },
      __proto__: { ms: 5000 },
      p06: { ms: 1e12, wpm: -3, acc: 7, ts: 1 },
    },
  });
  ok(st.projects.p01?.ms === 95_000, "un récord válido se conserva");
  ok(!("p02" in st.projects), "un tiempo de 0 ms se descarta (sería trampa)");
  ok(!("p03" in st.projects) && !("p04" in st.projects), "récords con tipos inválidos se descartan");
  ok(Object.keys(st.projects).every((k) => /^p\d{2}$/.test(k)), "solo claves de proyecto válidas");
  ok(st.projects.p06?.ms === 8.64e7 && st.projects.p06.wpm === 0 && st.projects.p06.acc === 1, "valores fuera de rango se acotan");
  ok(JSON.stringify(clean({ version: 1 }).projects) === "{}", "sin proyectos queda un objeto vacío");
}

// ── ejercicios de memoria ──
{
  const st = clean(JSON.parse(`{
    "version": 1,
    "recall": {
      "git-1-1": 1730000000000,
      "sql-3-4": "ayer",
      "git-1-1;x": 1,
      "__proto__": 1,
      "GIT-1-1": 1,
      "git-0-1": 1,
      "linux-2-3": -5
    }
  }`));
  ok(st.recall["git-1-1"] === 1730000000000, "un ejercicio resuelto se conserva");
  ok(Object.keys(st.recall).every((k) => /^[a-z]{1,16}-[1-9]-[1-9]\d?$/.test(k)), "solo claves de ejercicio válidas");
  ok(st.recall["sql-3-4"] === 0 && st.recall["linux-2-3"] === 0, "fechas inválidas quedan en 0");
  ok(Object.getPrototypeOf(st.recall) === Object.prototype && !Object.keys(st.recall).includes("__proto__"), "no se cuelan claves peligrosas");
  ok(JSON.stringify(clean({ version: 1 }).recall) === "{}", "sin ejercicios queda un objeto vacío");
}

// ── atajos de editor ──
{
  const st = clean(JSON.parse(`{
    "version": 1,
    "settings": { "vscodeKeys": "linux" },
    "shortcuts": {
      "vim-1-1": { "stars": 3, "keys": 3, "ms": 2100 },
      "vscode-2-1": { "stars": 9, "keys": 2, "ms": -4 },
      "vim-1-2": { "stars": 3, "keys": 0, "ms": 1 },
      "emacs-1-1": { "stars": 3, "keys": 3, "ms": 1 },
      "vim-1-3": "tres",
      "__proto__": { "stars": 3, "keys": 1, "ms": 1 }
    }
  }`));
  ok(st.settings.vscodeKeys === "pc" || st.settings.vscodeKeys === "mac", "atajos de VS Code: solo pc o mac");
  ok(JSON.stringify(st.shortcuts["vim-1-1"]) === '{"stars":3,"keys":3,"ms":2100}', "una marca válida se conserva");
  ok(st.shortcuts["vscode-2-1"]?.stars === 3 && st.shortcuts["vscode-2-1"].ms === 1, "estrellas y tiempo fuera de rango se acotan");
  ok(!("vim-1-2" in st.shortcuts) && !("vim-1-3" in st.shortcuts), "marcas con 0 teclas o de otro tipo se descartan");
  ok(Object.keys(st.shortcuts).every((k) => /^(vim|vscode)-[1-9]-[1-9]\d?$/.test(k)), "solo claves de ejercicios de atajos");
  ok(JSON.stringify(clean({ version: 1 }).shortcuts) === "{}", "sin atajos queda un objeto vacío");
}

// ── repaso de la Biblioteca ──
{
  const st = clean(JSON.parse(`{
    "version": 1,
    "review": {
      "lib-python-variables-print": { "box": 2, "due": "2026-11-05", "n": 3, "lapses": 1, "ts": 1 },
      "lib-git-x": { "box": 99, "due": "2026-01-01", "n": -4, "lapses": "x", "ts": 1e99 },
      "lib-bad-due": { "box": 1, "due": "mañana" },
      "__proto__": { "box": 1, "due": "2026-01-01" },
      "https://evil": { "box": 1, "due": "2026-01-01" },
      "lib-UPPER": { "box": 1, "due": "2026-01-01" },
      "lib-x-y": "texto"
    }
  }`));
  ok(st.review["lib-python-variables-print"]?.box === 2 && st.review["lib-python-variables-print"].due === "2026-11-05", "una entrada de repaso válida se conserva");
  const g = st.review["lib-git-x"];
  ok(g?.box === 4 && g.n === 0 && g.lapses === 0 && g.ts === 8.64e15, "valores de repaso fuera de rango se acotan");
  ok(Object.keys(st.review).length === 2, "se descartan claves inválidas, fechas mal escritas y valores que no son objetos");
  ok(!Object.prototype.hasOwnProperty.call(st.review, "__proto__") && ({} as Record<string, unknown>).box === undefined, "el repaso no permite contaminar prototipos");
  ok(JSON.stringify(clean({ version: 1 }).review) === "{}", "sin repaso queda un objeto vacío");
}

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
