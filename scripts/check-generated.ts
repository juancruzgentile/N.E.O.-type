// Compila el código que generan los lenguajes que se sumaron con su compilador real: cada concepto con cada
// entidad del vocabulario. Así una lección nunca enseña algo que no compila.
//
// Cubre C, C++ y Swift. Si falta el compilador, ese lenguaje se saltea con un aviso; con EJEMPLOS_ESTRICTO=1 (CI)
// falta un compilador es un error.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CONCEPTS, ENUM_SETS, type FullCtx, SHAPES } from "../src/gen/concepts";
import { ENTITIES, type Entity, type Field, type Nm, camel, makeCtx, makeRng, pascal, snake } from "../src/gen/base";
import { IMPLS } from "../src/gen/index";
import type { CodeLangId } from "../src/types";

const strict = process.env.EJEMPLOS_ESTRICTO === "1";
// TMPDIR permite elegir otra carpeta (algunos compiladores no pueden leer /tmp en entornos aislados)
const dir = mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), "neo-generado-"));
const has = (cmd: string) => spawnSync("sh", ["-c", `command -v ${cmd}`]).status === 0;
const run = (cmd: string, args: string[]) => {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 64 << 20 });
  return { ok: r.status === 0, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
};

interface Snippet {
  concept: string;
  text: string;
}

interface Target {
  lang: CodeLangId;
  compiler: string;
  /** lo que va antes de todo: includes, imports y tipos que los fragmentos suponen */
  prelude: string;
  /** declaración del tipo de cada entidad, igual que la genera classDef */
  struct: (e: Entity) => string;
  /**
   * "each": un archivo por fragmento (C, que no tiene namespaces y compila rápido).
   * "batch": todos en un archivo, cada uno envuelto para que los nombres no choquen (C++, Swift…).
   */
  mode: "each" | "batch";
  /** envoltura de un fragmento en modo batch; null si ese fragmento tiene que ir solo (por ejemplo, una extension) */
  wrap?: (s: Snippet, i: number) => string | null;
  ext: string;
  compile: (files: string[]) => { ok: boolean; out: string };
}

const cppName = (n: Nm) => ({ explicit: "is_explicit" })[snake(n)] ?? snake(n);
const cField = (f: Field) => (f.t === "str" ? `const char *${snake(f.n)}` : `${{ int: "int", float: "double", bool: "bool" }[f.t]} ${snake(f.n)}`);
const cppField = (f: Field) => `${{ int: "int", float: "double", str: "std::string", bool: "bool" }[f.t]} ${cppName(f.n)}{}`;
const swiftField = (f: Field) => `var ${camel(f.n)}: ${{ int: "Int", float: "Double", str: "String", bool: "Bool" }[f.t]}`;
const cWarnings = ["-Wall", "-Wextra", "-Werror", "-Wno-unused-function"];

const TARGETS: Target[] = [
  {
    lang: "c",
    compiler: "gcc",
    mode: "each",
    ext: "c",
    prelude: ["stdio.h", "stdlib.h", "string.h", "stdbool.h", "stddef.h", "ctype.h"].map((h) => `#include <${h}>`).join("\n"),
    struct: (e) => `typedef struct {\n${e.fields.map((f) => `    ${cField(f)};`).join("\n")}\n} ${pascal(e.s)};`,
    // -c en vez de -fsyntax-only: algunos envoltorios de compilador (zig cc) fallan con -fsyntax-only
    compile: ([f]) => run("gcc", ["-std=c17", ...cWarnings, "-c", "-o", `${f}.o`, f]),
  },
  {
    lang: "cpp",
    compiler: "g++",
    // en lote: cada archivo aparte volvía a procesar <format> y <ranges> y tardaba 9 minutos en el CI
    mode: "batch",
    wrap: (s, i) => `namespace fragmento_${i} {\n${s.text}\n}`,
    ext: "cpp",
    prelude: [
      ...["algorithm", "cctype", "filesystem", "format", "fstream", "functional", "iostream", "iterator", "map", "numbers",
        "numeric", "optional", "ranges", "span", "sstream", "stdexcept", "string", "string_view", "unordered_map", "utility", "vector"]
        .map((h) => `#include <${h}>`),
      "struct Shape { virtual ~Shape() = default; virtual double area() const = 0; };",
    ].join("\n"),
    struct: (e) => `struct ${pascal(e.s)} {\n${e.fields.map((f) => `    ${cppField(f)};`).join("\n")}\n};`,
    compile: ([f]) => run("g++", ["-std=c++20", ...cWarnings, "-c", "-o", `${f}.o`, f]),
  },
  {
    lang: "swift",
    compiler: "swiftc",
    mode: "batch",
    ext: "swift",
    prelude: [
      "import Foundation",
      "#if canImport(FoundationNetworking)",
      "import FoundationNetworking",
      "#endif",
      "protocol Shape { var area: Double { get } }",
    ].join("\n"),
    struct: (e) => `struct ${pascal(e.s)}: Codable {\n${e.fields.map((f) => `    ${swiftField(f)}`).join("\n")}\n}`,
    // las extensiones no se pueden anidar: esas van en su propio archivo
    wrap: (s, i) => (s.text.startsWith("extension ") ? null : `enum Fragmento${i} {\n${s.text}\n}`),
    compile: (files) => run("swiftc", ["-typecheck", ...files]),
  },
];

/** Todos los fragmentos distintos de un lenguaje, con la entidad que necesitan declarada. */
function snippetsOf(lang: CodeLangId): (Snippet & { ent: Entity })[] {
  const seen = new Set<string>();
  const out: (Snippet & { ent: Entity })[] = [];
  const rng = makeRng(7);
  for (const concept of CONCEPTS) {
    const impl = IMPLS[lang][concept.id];
    if (!impl) continue;
    for (const ent of ENTITIES) {
      for (let k = 0; k < 2; k++) {
        const ctx: FullCtx = { ...makeCtx(rng, ent), enumSet: ENUM_SETS[k % ENUM_SETS.length], shape: SHAPES[k % SHAPES.length] };
        const res = impl(ctx);
        for (const text of Array.isArray(res) ? res : [res]) {
          if (seen.has(text)) continue;
          seen.add(text);
          out.push({ concept: concept.id, text, ent });
        }
      }
    }
  }
  return out;
}

const errLines = (out: string) => out.split("\n").filter((l) => /error/.test(l));

let problems = 0;
const missing: string[] = [];
for (const t of TARGETS) {
  if (!has(t.compiler)) {
    missing.push(t.compiler);
    console.log(`${t.lang}: SALTEADO, falta ${t.compiler}`);
    continue;
  }
  const snippets = snippetsOf(t.lang);
  let bad = 0;
  const report = (s: Snippet, out: string) => {
    bad++;
    problems++;
    if (bad <= 5) console.log(`✗ [${t.lang}] ${s.concept}\n${s.text}\n${errLines(out).slice(0, 2).join("\n")}\n`);
  };

  if (t.mode === "each") {
    snippets.forEach((s, i) => {
      const file = join(dir, `${t.lang}-${i}.${t.ext}`);
      // classDef declara el tipo; el resto lo necesita declarado arriba
      writeFileSync(file, `${t.prelude}\n${s.concept === "classDef" ? "" : t.struct(s.ent)}\n\n${s.text}\n`);
      const r = t.compile([file]);
      if (!r.ok) report(s, r.out);
    });
  } else {
    // un archivo con todas las entidades y los fragmentos envueltos; los que no se pueden envolver van aparte
    const header = `${t.prelude}\n\n${ENTITIES.map(t.struct).join("\n\n")}\n`;
    const ranges: { from: number; to: number; s: Snippet }[] = [];
    let body = header;
    const alone: Snippet[] = [];
    snippets.forEach((s, i) => {
      const wrapped = t.wrap!(s, i);
      if (wrapped === null) return alone.push(s);
      const from = body.split("\n").length;
      body += `\n${wrapped}\n`;
      ranges.push({ from, to: body.split("\n").length, s });
    });
    const main = join(dir, `${t.lang}-lote.${t.ext}`);
    writeFileSync(main, body);
    const r = t.compile([main]);
    if (!r.ok) {
      // cada error dice "archivo:línea:": se busca a qué fragmento pertenece
      const hit = new Set<Snippet>();
      for (const line of errLines(r.out)) {
        const m = /:(\d+):\d+: error/.exec(line);
        const owner = m && ranges.find((x) => +m[1] >= x.from && +m[1] <= x.to);
        if (owner && !hit.has(owner.s)) {
          hit.add(owner.s);
          report(owner.s, line);
        }
      }
      if (!hit.size) report({ concept: "(lote)", text: "" }, r.out);
    }
    alone.forEach((s, i) => {
      const file = join(dir, `${t.lang}-solo-${i}.${t.ext}`);
      writeFileSync(file, `${header}\n${s.text}\n`);
      const r2 = t.compile([file]);
      if (!r2.ok) report(s, r2.out);
    });
  }
  console.log(`${t.lang}: ${snippets.length - bad}/${snippets.length} fragmentos compilan`);
}
rmSync(dir, { recursive: true, force: true });

if (missing.length && strict) {
  console.log(`Faltan compiladores (${missing.join(", ")}) y EJEMPLOS_ESTRICTO=1`);
  problems++;
}
console.log(problems ? `\nPROBLEMAS: ${problems}` : "\nTodo el código generado compila");
process.exit(problems ? 1 : 0);
