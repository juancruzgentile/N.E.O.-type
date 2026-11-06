// Revisa el banco de preguntas de entrevista.
// - Estructura: ids, opciones, explicación y fuente en todas.
// - Las preguntas "¿qué imprime?" se CORREN con el intérprete o compilador del lenguaje y la salida tiene que ser la
//   respuesta marcada como correcta. Si falta la herramienta, se saltea con un aviso; con PREGUNTAS_ESTRICTO=1 (CI) es error.
// - Con FUENTES_RED=1 además abre el link de cada pregunta.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { transformSync } from "esbuild";
import { AREAS } from "../src/interview/catalogo";
import { BANCO } from "../src/interview/bank/index";
import { check } from "../src/recall/check";

const strict = process.env.PREGUNTAS_ESTRICTO === "1";
const tmp = mkdtempSync(join(tmpdir(), "neo-preguntas-"));
let problems = 0;
const bad = (id: string, msg: string) => {
  problems++;
  console.log(`✗ ${id}: ${msg}`);
};

// ── estructura ──
const ids = new Set<string>();
const MINIMO = Number(process.env.PREGUNTAS_MINIMO ?? 0);
for (const q of BANCO) {
  if (ids.has(q.id)) bad(q.id, "id repetido");
  ids.add(q.id);
  if (!/^[a-z]{1,12}-\d{2,3}$/.test(q.id) || !q.id.startsWith(q.area + "-")) bad(q.id, "id mal formado");
  if (!AREAS.some((a) => a.id === q.area)) bad(q.id, `el área ${q.area} no existe`);
  if (q.texto.trim().length < 10) bad(q.id, "texto muy corto");
  if (q.explica.trim().length < 25) bad(q.id, "la explicación es muy corta");
  if (!/^https:\/\/\S+$/.test(q.fuente)) bad(q.id, "la fuente no es un link https");
  if (q.formato === "codigo") {
    if (!q.respuestas?.length) bad(q.id, "una pregunta de código necesita respuestas");
    else for (const r of q.respuestas) if (check(r, q.respuestas, q.kind ?? "code").status !== "ok") bad(q.id, `la respuesta "${r}" no pasa el corrector`);
  } else {
    const o = q.opciones ?? [];
    if (o.length < 3 || o.length > 5) bad(q.id, `tiene ${o.length} opciones (tienen que ser de 3 a 5)`);
    if (new Set(o.map((x) => x.trim())).size !== o.length) bad(q.id, "hay opciones repetidas");
    if (o.some((x) => x.trim() === "")) bad(q.id, "hay una opción vacía");
  }
  if ((q.formato === "salida" || q.formato === "error") && !q.codigo) bad(q.id, "falta el código");
}
// sesgo de largo: si la correcta suele ser la más larga, se acierta sin saber. Se pide que no pase del 45 %.
{
  const con = BANCO.filter((q) => q.opciones && q.formato !== "salida");
  const masLarga = con.filter((q) => q.opciones![0].length >= Math.max(...q.opciones!.map((o) => o.length))).length;
  const pct = con.length ? Math.round((masLarga / con.length) * 100) : 0;
  if (pct > 45) bad("banco", `la respuesta correcta es la más larga en el ${pct} % de las preguntas (máximo 45 %): igualá el largo de las opciones`);
}
if (BANCO.length < MINIMO) bad("banco", `hay ${BANCO.length} preguntas y se esperaban al menos ${MINIMO}`);

// ── "¿qué imprime?": se corre el código ──
const has = (cmd: string) => spawnSync("sh", ["-c", `command -v ${cmd}`]).status === 0;
const run = (cmd: string, args: string[], cwd = tmp) => {
  const r = spawnSync(cmd, args, { encoding: "utf8", cwd, timeout: 60_000 });
  return { ok: r.status === 0, out: `${r.stdout ?? ""}`, err: `${r.stderr ?? ""}` };
};
const norm = (s: string) => s.split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").trim();
type Runner = { tool: string[]; run: (src: string) => { ok: boolean; out: string; err: string } };
const file = (name: string, src: string) => (writeFileSync(join(tmp, name), src), name);
const RUNNERS: Record<string, Runner> = {
  python: { tool: ["python3"], run: (s) => run("python3", [file("p.py", s)]) },
  javascript: { tool: ["node"], run: (s) => run("node", [file("p.js", s)]) },
  typescript: { tool: ["node"], run: (s) => run("node", [file("p.js", transformSync(s, { loader: "ts" }).code)]) },
  go: { tool: ["go"], run: (s) => run("go", ["run", file("main.go", s)]) },
  c: { tool: ["gcc"], run: (s) => { const c = run("gcc", [file("m.c", s), "-o", "c.out"]); return c.ok ? run(join(tmp, "c.out"), []) : c; } },
  cpp: { tool: ["g++"], run: (s) => { const c = run("g++", [file("m.cpp", s), "-std=c++20", "-o", "cpp.out"]); return c.ok ? run(join(tmp, "cpp.out"), []) : c; } },
  java: { tool: ["java"], run: (s) => run("java", [file("Main.java", s)]) },
  rust: { tool: ["rustc"], run: (s) => { const c = run("rustc", ["--edition", "2024", file("m.rs", s), "-o", "rust.out"]); return c.ok ? run(join(tmp, "rust.out"), []) : c; } },
  php: { tool: ["php"], run: (s) => run("php", [file("p.php", s)]) },
};
const faltan = new Set<string>();
let corridas = 0;
for (const q of BANCO.filter((x) => x.formato === "salida")) {
  const lang = q.lang ?? q.area;
  const r = RUNNERS[lang];
  if (!r) {
    bad(q.id, `no hay forma de correr código ${lang}: usá otro formato`);
    continue;
  }
  const falta = r.tool.find((t) => !has(t));
  if (falta) {
    faltan.add(falta);
    continue;
  }
  const out = r.run(q.codigo!);
  corridas++;
  if (!out.ok) bad(q.id, `el código no corre: ${out.err.split("\n").find((l) => l.trim()) ?? out.out}`);
  else if (norm(out.out) !== norm(q.opciones![0])) bad(q.id, `imprime ${JSON.stringify(norm(out.out))} y la respuesta marcada es ${JSON.stringify(norm(q.opciones![0]))}`);
}
if (faltan.size) {
  console.log(`\nSin correr algunas preguntas porque falta: ${[...faltan].join(", ")}`);
  if (strict) {
    console.log("Con PREGUNTAS_ESTRICTO=1 tienen que estar todas las herramientas");
    problems++;
  }
}

// ── links ──
if (process.env.FUENTES_RED === "1") {
  const pages = new Map<string, Promise<{ status: number; html: string }>>();
  const load = (url: string) => {
    let p = pages.get(url);
    if (!p) {
      p = fetch(url, { redirect: "follow", headers: { "user-agent": "neo-type-check-preguntas" }, signal: AbortSignal.timeout(30000) })
        .then(async (r) => ({ status: r.status, html: r.ok ? await r.text() : "" }))
        .catch(() => ({ status: 0, html: "" }));
      pages.set(url, p);
    }
    return p;
  };
  let next = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (next < BANCO.length) {
      const q = BANCO[next++];
      const [page, hash] = q.fuente.split("#");
      const r = await load(page);
      if (r.status !== 200) bad(q.id, `${q.fuente} respondió ${r.status || "sin respuesta"}`);
      else if (hash && !new RegExp(`(id|name)=["']?${hash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["' >]`).test(r.html)) bad(q.id, `${q.fuente} no tiene el ancla #${hash}`);
    }
  }));
  console.log(`\nLinks abiertos: ${BANCO.length} (${pages.size} páginas)`);
}

rmSync(tmp, { recursive: true, force: true });
const porArea = AREAS.map((a) => `${a.id}:${BANCO.filter((q) => q.area === a.id).length}`).join(" ");
console.log(`\n${BANCO.length} preguntas (${corridas} corridas de verdad) — ${porArea}`);
console.log(problems ? `\nPROBLEMAS: ${problems}` : "\nEl banco de preguntas está bien");
process.exit(problems ? 1 : 0);
