// Tests de regresión de los errores encontrados en las auditorías (ver correcciones.txt).
// Uso: npm run test:regression
import { readFileSync } from "node:fs";
import { TypingSession } from "../src/engine/session";
import { MAX_IMPORT_BYTES, byteLength } from "../src/sanitize";
import { initialState, parseBackup, serializeState } from "../src/store";
import { emptyProfile, fullSet } from "../src/engine/stats";
import { totalsOf } from "../src/engine/totals";
import { findSnippet } from "../src/gen/index";
import { makeRng } from "../src/gen/base";
import { LANG_ORDER } from "../src/data/curriculum";
import { TRACK_ORDER } from "../src/tracks/index";
import { TOPICS } from "../src/library/index";
import { ALL_TOPICS } from "../src/library/unlock";
import { isFullProgram, kindNote } from "../src/library/kind";
import { go as goGen } from "../src/gen/lang/go";
import { LAYOUTS } from "../src/data/layouts";
import { check } from "../src/recall/check";
import { tramos } from "../src/library/marcas";
import { FUENTES, fuenteDe } from "../src/library/fuentes/index";
import type { AppState, LessonResult } from "../src/types";

let failed = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) failed++;
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
};
const type = (s: TypingSession, keys: string, mode: "block" | "advance" | "strict") =>
  [...keys].map((ch, i) => s.input(ch, 1000 + i * 200, mode));

// ── motor de sesiones ──
for (const mode of ["advance", "strict"] as const) {
  const s = new TypingSession("abc");
  const res = type(s, "abX", mode);
  ok(res[2] === "error" && s.done && s.result().errors === 1, `${mode}: error en el último carácter devuelve error, cierra y cuenta`);
}
{
  const s = new TypingSession("abc");
  const res = type(s, "abc", "block");
  ok(res[2] === "done" && s.result().errors === 0 && s.result().acc === 1, "texto correcto: done con 0 errores");
}
{
  const s = new TypingSession("abc");
  type(s, "abX", "block");
  s.stop(2000);
  const r = s.result();
  ok(r.chars === 2 && r.attempted === 3, "posición pendiente: suma intentos pero no caracteres");
  ok(r.errors === 1 && Math.abs(r.acc - 2 / 3) < 1e-9, "posición pendiente: cuenta en la precisión");
  ok(s.samples().some((x) => x.char === "c" && x.error), "posición pendiente: entra en las muestras");
}

// ── copias de seguridad ──
ok(byteLength("ñ") === 2 && byteLength("a") === 1, "byteLength cuenta bytes UTF-8 (igual que File.size)");
{
  // estado grande y válido: un perfil por lenguaje y teclado, con 500 lecciones cada uno (el caso de la auditoría)
  const big: AppState = initialState();
  const lesson: LessonResult = { ts: 1_700_000_000_000, wpm: 61.234567, acc: 0.98765, chars: 240, ms: 52_345, score: 1234, kind: "code" };
  const langs = [...LANG_ORDER, ...TRACK_ORDER];
  for (const lang of langs) for (const layout of Object.keys(LAYOUTS)) {
    const lessons = Array.from({ length: 500 }, (_, i) => ({ ...lesson, ts: lesson.ts + i }));
    big.profiles[`${lang}:${layout}`] = { ...emptyProfile(), lessons, totals: totalsOf(lessons) };
  }
  const json = serializeState(big);
  const expected = langs.length * Object.keys(LAYOUTS).length;
  ok(Object.keys(big.profiles).length === expected, `estado de prueba con ${expected} perfiles`);
  ok(!json.includes("\n"), "la exportación es JSON compacto");
  ok(byteLength(json) <= MAX_IMPORT_BYTES, `una exportación grande entra en el límite (${byteLength(json)} bytes)`);
  let restored: AppState | null = null;
  try {
    restored = parseBackup(json);
  } catch {
    restored = null;
  }
  // se compara contra el estado original, no contra otra importación
  const canon = (v: unknown): unknown =>
    Array.isArray(v) ? v.map(canon)
    : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon((v as Record<string, unknown>)[k])]))
    : v;
  const same = (a: unknown, b: unknown) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
  ok(restored !== null && same(restored.profiles, big.profiles), "esa exportación se vuelve a importar sin perder progreso");
  ok(restored !== null && same(restored, big), "y el estado completo queda igual al exportado");
  const huge = { ...initialState(), settings: { ...initialState().settings, userName: "x".repeat(MAX_IMPORT_BYTES) } };
  let threw = false;
  try {
    serializeState(huge);
  } catch {
    threw = true;
  }
  ok(threw, "exportar más de 5 MiB avisa en vez de generar una copia inservible");
  let rejected = false;
  try {
    parseBackup(" ".repeat(MAX_IMPORT_BYTES + 1));
  } catch {
    rejected = true;
  }
  ok(rejected, "importar más de 5 MiB se rechaza");
}

// ── conceptos: no se repite el anterior si hay alternativa ──
{
  let repeats = 0;
  let runs = 0;
  for (const lang of ["python", "javascript", "rust"] as const) {
    const allowed = fullSet(lang, initialState().settings);
    for (const focus of [null, "0", "("]) {
      for (let seed = 1; seed <= 150; seed++) {
        const rng = makeRng(seed);
        const a = findSnippet(lang, allowed, focus, rng);
        if (!a) continue;
        const b = findSnippet(lang, allowed, focus, rng, [a.concept]);
        runs++;
        if (b && b.concept === a.concept) repeats++;
      }
    }
  }
  ok(runs > 0 && repeats === 0, `ningún concepto repetido en ${runs} lecciones consecutivas`);
}
{
  // caso reproducido en la re-auditoría: Python, foco 0, semilla 123
  const allowed = fullSet("python", initialState().settings);
  const rng = makeRng(123);
  const a = findSnippet("python", allowed, "0", rng);
  const b = a && findSnippet("python", allowed, "0", rng, [a.concept]);
  ok(!!a && !!b && a.concept !== b.concept, "Python foco 0 semilla 123: el concepto no se repite");
}

// ── música: la selección sigue a la canción, no al índice ──
{
  // dobles mínimos de Web Audio y <audio> para correr el motor en Node
  const node: any = new Proxy(function () {}, {
    get: (_t, k) => (k === "then" ? undefined : k === "currentTime" ? 0 : node),
    apply: () => node,
    set: () => true,
  });
  const g = globalThis as any;
  g.AudioContext = class {
    sampleRate = 8;
    currentTime = 0;
    state = "running";
    destination = node;
    createBuffer = (_c: number, len: number) => ({ getChannelData: () => new Float32Array(len) });
    constructor() {
      return new Proxy(this, { get: (t: any, k) => (k in t ? t[k] : () => node) });
    }
  };
  let created = 0;
  const audios: { currentTime: number; paused: boolean }[] = [];
  g.Audio = class {
    src: string;
    currentTime = 0;
    paused = true;
    onended: (() => void) | null = null;
    constructor(src: string) {
      this.src = src;
      created++;
      audios.push(this);
    }
    play() {
      this.paused = false;
      return Promise.resolve();
    }
    pause() {
      this.paused = true;
    }
  };
  (URL as any).createObjectURL = (b: { tag: string }) => b.tag;
  (URL as any).revokeObjectURL = () => {};
  const { music } = await import("../src/audio/music");
  const t = (id: string) => ({ id, name: id.toUpperCase(), blob: { tag: id } as unknown as Blob });
  music.setTracks([t("a"), t("b"), t("c")]);
  music.playUser(1);
  music.setTracks([t("b"), t("c")]);
  ok(music.snap.userIndex === 0 && music.snap.userTracks[music.snap.userIndex].id === "b" && music.snap.playing,
    "quitar una canción anterior mantiene seleccionada la que suena");
  const before = created;
  const el = audios[audios.length - 1];
  el.currentTime = 42.5;
  music.pause();
  ok(el.paused && !music.snap.playing && el.currentTime === 42.5, "pausar detiene la canción en su posición");
  music.resume();
  ok(created === before && music.snap.playing && !el.paused && audios[audios.length - 1] === el,
    "reanudar sigue con el mismo audio");
  ok(el.currentTime === 42.5, "reanudar continúa desde 42,5 s (no vuelve al principio)");
  music.setTracks([t("c")]);
  ok(!music.snap.playing && music.snap.userIndex === 0, "quitar la canción que suena la detiene");
}

// ── CSS: en modo calmo los logros quedan visibles ──
{
  const css = readFileSync("src/styles.css", "utf8");
  ok(/html\.calm \.toast\s*\{[^}]*animation:\s*none\s*!important[^}]*opacity:\s*1/.test(css), "modo calmo: el aviso de logro no se anima y queda visible");
}

// ── auditoría 1.6.0: ejemplos de la Biblioteca ──
{
  const topic = (id: string) => TOPICS.find((t) => t.id === id)!;
  const entry = (t: string, name: string) => topic(t).entries.find((e) => e.name === name)!;
  const goErr = entry("go", "if err != nil y %w").code;
  // el return del error tiene que estar en una función y errors.Is fuera de ella
  const endOfFunc = goErr.indexOf("\n}");
  ok(endOfFunc > goErr.indexOf("return nil, fmt.Errorf") && goErr.indexOf("return nil, fmt.Errorf") > 0 && goErr.indexOf("errors.Is") > endOfFunc, "Go: errors.Is se usa en quien llama, no después del return");
  ok(/make\(chan string, 1\)/.test(entry("go", "Canales y select").code), "Go: el canal del timeout tiene búfer y la goroutine no queda colgada");
  ok(/PRAGMA foreign_keys = ON/.test(entry("sql", "Claves foráneas").code), "SQL: las claves foráneas avisan que SQLite las activa por conexión");
  ok(!topic("sql").entries.some((e) => /DATE '/.test(e.code)), "SQL: sin literales DATE '…' que SQLite no entiende");
  ok(/EXPLAIN QUERY PLAN/.test(entry("sql", "EXPLAIN").code), "SQL: EXPLAIN muestra la variante de SQLite");
  ok(!topic("java").entries.some((e) => /\(\) -> \d+ \/ \d+\)/.test(e.code)), "Java: assertThrows recibe una llamada, no una expresión suelta");
  // C#: con instrucciones de nivel superior, los tipos van después
  const csBad = topic("csharp").entries.filter((e) => {
    const lines = e.code.split("\n");
    const firstType = lines.findIndex((l) => /^(public |internal )?(sealed |abstract |static )?(class|record|struct|interface|enum) /.test(l));
    return firstType >= 0 && lines.slice(firstType).some((l) => /^(var |Console\.|await )/.test(l));
  });
  ok(csBad.length === 0, `C#: ningún ejemplo pone código suelto después de una clase${csBad.length ? " — " + csBad.map((e) => e.name).join(", ") : ""}`);
  ok(/node app\.ts no lo acepta/.test(entry("typescript", "Clases con modificadores").desc), "TypeScript: avisa que las propiedades en el constructor no corren con node app.ts");
  ok(/command="show-modal"/.test(entry("html", "dialog y details").code), "HTML: el ejemplo de dialog trae cómo abrirlo");
  // GitHub Actions: el ejemplo usa la misma versión mayor que el CI del proyecto
  const ci = readFileSync(".github/workflows/ci.yml", "utf8");
  const ex = entry("formats", "GitHub Actions").code;
  const major = (re: RegExp, txt: string) => re.exec(txt)?.[1];
  ok(major(/checkout@\S+ # v(\d+)/, ci) === major(/checkout@v(\d+)/, ex) && major(/setup-node@\S+ # v(\d+)/, ci) === major(/setup-node@v(\d+)/, ex),
    "Actions: el ejemplo usa las mismas versiones mayores que el CI del proyecto");
}

// ── auditoría 1.6.0: capitalizar en Go respeta UTF-8 ──
{
  const out = goGen.capitalize!({} as never);
  const code = Array.isArray(out) ? out.join("\n") : out;
  ok(!/word\[:1\]/.test(code) && /\[\]rune\(word\)/.test(code), "Go: CapitalizeWords trabaja con runas, no con el primer byte");
}

// ── auditoría de la Biblioteca del 2026-11-03 (bd327bb) ──
{
  const entry = (topic: string, name: string) => ALL_TOPICS.find((t) => t.id === topic)!.entries.find((e) => e.name === name)!;
  const fk = entry("sql", "Claves foráneas");
  const inline = fk.code.split("\n").filter((l) => /REFERENCES/.test(l) && !/FOREIGN KEY/.test(l));
  ok(/FOREIGN KEY \(\w+\) REFERENCES/.test(fk.code) && inline.length === 0, "SQL: la clave foránea es una restricción aparte (MySQL ignora REFERENCES en la columna)");
  // los hooks de React no se llaman sueltos, fuera de un componente
  const react = ALL_TOPICS.find((t) => t.id === "react")!;
  const loose = react.entries.filter((e) => /^(const|let) [^=]+= use[A-Z]\w*\(/m.test(e.code)).map((e) => e.name);
  ok(loose.length === 0, `React: ningún hook fuera de un componente${loose.length ? " — " + loose.join(", ") : ""}`);
  const modelo = entry("django", "Modelos").code;
  const usados = [...entry("django", "Transacciones y F").code.matchAll(/F\("(\w+)"\)/g)].map((m) => m[1]);
  ok(usados.every((campo) => new RegExp(`^\\s+${campo} = models\\.`, "m").test(modelo)), "Django: los campos que usa F() existen en el modelo Producto");
  ok(/\*fin != '\\0'/.test(entry("c", "Errores con errno").code), "C: strtol revisa que no sobre texto después del número");
  ok(!/línea completa/.test(entry("c", "fgets y sscanf").desc), "C: fgets no promete leer siempre la línea completa");
  ok(!/vacío/.test(entry("cpp", "Semántica de movimiento").code), "C++: no promete que el objeto movido quede vacío");
  // en lenguajes compilados, un cuerpo /* ... */ deja la función sin el valor que promete
  const compiled = ["rust", "c", "cpp", "java", "csharp", "go", "swift", "kotlin"];
  const stubs = ALL_TOPICS.filter((t) => compiled.includes(t.id)).flatMap((t) => t.entries.filter((e) => /\{\s*\/\*\s*\.\.\.\s*\*\/\s*\}/.test(e.code)).map((e) => `${t.id}: ${e.name}`));
  ok(stubs.length === 0, `ningún ejemplo de un lenguaje compilado tiene un cuerpo /* ... */${stubs.length ? " — " + stubs.join(", ") : ""}`);
  ok(/user-secrets[^.]*variables de entorno/.test(ALL_TOPICS.find((t) => t.id === "aspnet")!.workflow.map((w) => w.text).join(" ")), "ASP.NET: las variables de entorno pisan a user-secrets");
  // programas completos vs. fragmentos: la Biblioteca lo avisa y el CI compila los completos
  const cEntry = (topic: string, name: string) => ALL_TOPICS.find((t) => t.id === topic)!.entries.find((e) => e.name === name)!;
  ok(isFullProgram("rust", cEntry("rust", "fn main y println!")), "un ejemplo con fn main se marca como programa completo");
  ok(!isFullProgram("rust", cEntry("rust", "let y mut")), "un fragmento de Rust no se marca como completo");
  ok(kindNote("python", cEntry("python", ALL_TOPICS.find((t) => t.id === "python")!.entries[0].name))?.full === false, "un fragmento de Python avisa que le falta el resto");
  ok(kindNote("git", cEntry("git", ALL_TOPICS.find((t) => t.id === "git")!.entries[0].name)) === null, "los comandos de terminal no se marcan ni como fragmento ni como completo");
  ok(/#include <stdio\.h>/.test(cEntry("c", "Funciones y prototipos").code), "C: el ejemplo completo de funciones incluye stdio.h para compilar");
}

// ── proyectos: lo que hacen de verdad ──
{
  const ts = (await import("typescript")).default;
  const { PROJECTS } = await import("../src/projects/projects");
  const texto = PROJECTS.find((p) => p.id === "p05")!.files.find((f) => f.name === "inventario.ts")!.text.split("\nconst inv = new Inventario")[0];
  const js = ts.transpileModule(texto.replace(/^import .*$/m, ""), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod: { exports: { Inventario?: new () => any } } = { exports: {} };
  new Function("module", "exports", js)(mod, mod.exports);
  const inv = new mod.exports.Inventario!();
  const prod = inv.agregar({ nombre: "Yerba", categoria: "comida", precio: 3.5, stock: 10 });
  const falla = (n: number) => { try { inv.mover(prod.id, n, "salida"); return false; } catch { return true; } };
  ok(falla(-5) && falla(0) && falla(NaN) && falla(Infinity), "inventario: rechaza cantidades negativas, cero, NaN e Infinity");
  ok(prod.stock === 10, "inventario: una cantidad inválida no cambia el stock");
  inv.mover(prod.id, 4, "salida");
  ok(prod.stock === 6 && inv.historial(prod.id).length === 1, "inventario: una salida válida resta y queda en el historial");
}

// el conversor de Swift redondea bien con signo y no se cae con valores enormes
{
  const { PROJECTS } = await import("../src/projects/projects");
  const swift = PROJECTS.find((p) => p.id === "p15")!.files.find((f) => f.name === "main.swift")!.text;
  ok(/let redondeado = Double\(Int\(centesimas \+ \(centesimas < 0 \? -0\.5 : 0\.5\)\)\) \/ 100/.test(swift), "Swift: el redondeo suma o resta media centésima según el signo");
  const redondear = (v: number) => Math.trunc(v * 100 + (v * 100 < 0 ? -0.5 : 0.5)) / 100; // misma cuenta que el programa; Int() trunca
  ok(redondear(-1) === -1 && redondear(-10) === -10 && redondear(-2.5) === -2.5 && redondear(2.5) === 2.5 && redondear(-0.126) === -0.13 && redondear(0.126) === 0.13, "Swift: los negativos no se corren (-1 sigue siendo -1)");
  ok(/valor\.isFinite, abs\(valor\) < 1_000_000_000/.test(swift), "Swift: parsear rechaza valores infinitos o demasiado grandes para Int");
}

// el blog de Django no manda a un 404 después de guardar un borrador
{
  const { PROJECTS } = await import("../src/projects/projects");
  const views = PROJECTS.find((p) => p.id === "p19")!.files.find((f) => f.name === "blog/views.py")!.text;
  const nuevo = views.slice(views.indexOf("def nuevo"));
  ok(/if not articulo\.publicado:\s+#[^\n]*\n\s+return redirect\("lista"\)/.test(nuevo) && /return redirect\("detalle", pk=articulo\.pk\)/.test(nuevo), "Django: un borrador vuelve a la lista y solo lo publicado redirige al detalle");
  ok(/get_object_or_404\(Articulo, pk=pk, publicado=True\)/.test(views), "Django: el detalle público sigue exigiendo publicado=True");
}

// las clases de la Biblioteca respetan la plantilla: secciones con texto, tablas rectangulares y fuentes https con fecha
{
  const conClase = ALL_TOPICS.filter((t) => t.clase);
  ok(conClase.some((t) => t.id === "python"), "Biblioteca: Python tiene su clase");
  for (const t of conClase) {
    const c = t.clase!;
    const secciones = c.secciones;
    const mal = secciones.filter((x) => !x.heading || x.parrafos.length === 0 || x.parrafos.some((p) => !p.trim()));
    const tablas = secciones.filter((x) => x.tabla && x.tabla.filas.some((f) => f.length !== x.tabla!.cabeza.length));
    ok(mal.length === 0 && tablas.length === 0, `clase de ${t.name}: secciones con texto y tablas rectangulares${mal.length ? " — " + mal[0].heading : ""}`);
    ok(!c.fuentes || (c.fuentes.every((f) => f.url.startsWith("https://")) && /^\d{4}-\d{2}-\d{2}$/.test(c.revisada ?? "")), `clase de ${t.name}: las fuentes son https y traen la fecha de revisión`);
  }
  for (const t of conClase.filter((x) => x.group !== "IA")) {
    const c = t.clase!;
    ok(c.secciones.length >= 9 && c.secciones.some((x) => x.tabla) && c.secciones.some((x) => x.codigo) && !!c.fuentes?.length, `clase de ${t.name}: al menos 9 secciones, con tabla, código y fuentes`);
  }
}

// ── auditoría de Codex del 2026-11-14 (d52dd83) ──
{
  const pipe = ["ps aux | grep node", "ps -ef | grep node"];
  ok(check("ps aux && grep node", pipe, "shell").status === "wrong", "memoria: && no vale por | (no pasa la salida)");
  ok(check("ps aux | grep node", pipe, "shell").status === "ok" && check("ps  aux | grep node", pipe, "shell").status === "minor", "memoria: la tubería correcta sigue aprobando");
  ok(check("ps -e -f | grep node", ["ps -f -e | grep node"], "shell").status === "minor", "memoria: el orden de opciones sigue siendo tolerado");
  const txt = (id: string) => JSON.stringify(TOPICS.find((t) => t.id === id));
  ok(!/postgres:18[^`]*\/var\/lib\/postgresql\/data/.test(txt("docker")), "docker: postgres:18 monta el volumen en /var/lib/postgresql");
  ok((txt("asincronia").match(/acks_late=True/g) ?? []).length >= 2, "celery: los ejemplos confirman al terminar (acks_late)");
  ok(!/EXPIRE limite:ip:1\.2\.3\.4 60\\n/.test(txt("redis")) && txt("redis").includes("60 NX"), "redis: el límite por minuto no renueva el vencimiento");
  const apis = txt("apis");
  ok(apis.includes("const recibida = Buffer.from(") && apis.includes("Date.parse(valor"), "apis: firma comparada en bytes y Retry-After con fecha HTTP");
  ok(!txt("mongodb").includes("updateOne sin operadores") && !txt("mongodb").includes("Sin operador, reemplazaría"), "mongodb: updateOne sin operadores da error, no reemplaza");
  const cx = txt("codex");
  ok(cx.includes("codex resume --last   # retoma la ultima") && cx.includes("codex features list") && cx.includes("codex apply TASK_ID"), "codex: resume, features y apply como los pide la CLI");
  ok(!cx.includes("mcp login context7") && !cx.includes("Nada más que eso") && cx.includes("~/.codex/AGENTS.md"), "codex: login solo para MCP remoto, entrenamiento posterior y AGENTS.md global");
}

// ── clases: el resaltado solo toma marcas completas (auditoría de Codex del 2026-11-14) ──
{
  const t = tramos("**clave** y `cod` y **suelto y `otro");
  ok(t[0].tipo === "clave" && t[0].t === "clave" && t[2].tipo === "cod" && t[2].t === "cod", "resaltado: negrita y código completos");
  ok(t.length === 4 && t[3].tipo === "texto" && t[3].t === " y **suelto y `otro", "resaltado: una marca sin cerrar queda como texto, sin perder letras");
}

// ── clases: las marcas de resaltado (**clave** y `código`) están bien cerradas ──
for (const t of TOPICS.filter((x) => x.clase)) {
  const c = t.clase!;
  const textos = [c.bajada, ...c.secciones.flatMap((x) => [...x.parrafos, ...(x.lista ?? []), ...(x.tabla?.filas.flat() ?? [])])];
  const mal = textos.find((x) => (x.split("**").length - 1) % 2 !== 0 || (x.split("`").length - 1) % 2 !== 0 || (x.match(/\*\*[^*]+\*\*/g) ?? []).some((m) => /^\*\*\s|\s\*\*$|`/.test(m)));
  ok(!mal && !c.secciones.some((x) => /\*\*|`/.test(x.heading)), `clase de ${t.name}: el resaltado abre y cierra bien${mal ? " — " + mal.slice(0, 60) : ""}`);
}

// ── auditoría de IA de Codex del 2026-11-14 (fce96f4) ──
{
  ok(Object.values(FUENTES).every((f) => !f.revisado || /^\d{4}-\d{2}-\d{2}$/.test(f.revisado)), "fuentes: la fecha de revisión de cada tema es AAAA-MM-DD");
  const oc = TOPICS.find((t) => t.id === "opencode")!;
  ok(fuenteDe("opencode", oc.entries[0].name)?.revisado === "2026-11-14", "fuentes: OpenCode muestra el día en que se revisó, no la fecha general");
  const txt = (id: string) => JSON.stringify(TOPICS.find((t) => t.id === id));
  ok(!txt("antigravity").includes("--mode=default") && !txt("antigravity").includes('\\"agentMode\\": \\"default\\"') && txt("antigravity").includes("--mode=plan"), "antigravity: default es sin --mode y agentMode vacío; plan es un modo");
  ok(!txt("claude").includes("sin ningún control") && !txt("claude").includes("no pide permiso para nada"), "claude: bypassPermissions no se explica como \"sin ningún control\"");
  ok(txt("hermes").includes("no un aislamiento") && txt("hermes").includes("--oss"), "hermes: la protección de archivos no limita a la terminal; Codex también acepta locales");
  ok(!/gemini update\s/.test(txt("gemini").replace(/gemini update no existe/g, "")), "gemini: no se enseña gemini update como actualizador");
  ok(txt("chatgpt").includes("Include environments") && txt("chatgpt").includes("store=false"), "chatgpt: Include environments de Codex es aparte y store=false no es retención cero");
  ok(txt("opencode").includes("--oss") && txt("opencode").includes("carpeta personal"), "opencode: Codex también acepta modelos locales y AGENTS.md puede subir hasta el home");
}

console.log(failed ? `\n${failed} test(s) fallaron` : "\nTodos los tests de regresión pasaron");
process.exit(failed ? 1 : 0);
