// Compila el código que generan los lenguajes compilados nuevos: cada concepto con cada entidad del vocabulario,
// con advertencias como errores. Así una lección nunca enseña algo que no compila.
//
// Por ahora cubre C y C++. Si falta el compilador, se saltea con un aviso; con EJEMPLOS_ESTRICTO=1 (CI) falla.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CONCEPTS, ENUM_SETS, type FullCtx, SHAPES } from "../src/gen/concepts";
import { ENTITIES, type Entity, type Field, type Nm, makeCtx, makeRng, pascal, snake } from "../src/gen/base";
import { IMPLS } from "../src/gen/index";

const strict = process.env.EJEMPLOS_ESTRICTO === "1";
// TMPDIR permite elegir otra carpeta (algunos compiladores no pueden leer /tmp en entornos aislados)
const dir = mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), "neo-generado-"));
const has = (cmd: string) => spawnSync("sh", ["-c", `command -v ${cmd}`]).status === 0;

interface Target {
  lang: "c" | "cpp";
  compiler: string;
  flags: string[];
  ext: string;
  prelude: string;
  /** declaración del tipo de la entidad, igual que la genera classDef */
  struct: (e: Entity) => string;
}

const cppName = (n: Nm) => ({ explicit: "is_explicit" })[snake(n)] ?? snake(n);
const cField = (f: Field) => (f.t === "str" ? `const char *${snake(f.n)}` : `${{ int: "int", float: "double", bool: "bool" }[f.t]} ${snake(f.n)}`);
const cppField = (f: Field) => `${{ int: "int", float: "double", str: "std::string", bool: "bool" }[f.t]} ${cppName(f.n)}{}`;

const TARGETS: Target[] = [
  {
    lang: "c",
    compiler: "gcc",
    flags: ["-std=c17"],
    ext: "c",
    prelude: ["stdio.h", "stdlib.h", "string.h", "stdbool.h", "stddef.h", "ctype.h"].map((h) => `#include <${h}>`).join("\n"),
    struct: (e) => `typedef struct {\n${e.fields.map((f) => `    ${cField(f)};`).join("\n")}\n} ${pascal(e.s)};`,
  },
  {
    lang: "cpp",
    compiler: "g++",
    flags: ["-std=c++20"],
    ext: "cpp",
    prelude: [
      ...["algorithm", "cctype", "filesystem", "format", "fstream", "functional", "iostream", "iterator", "map", "numbers",
        "numeric", "optional", "ranges", "span", "sstream", "stdexcept", "string", "string_view", "unordered_map", "utility", "vector"]
        .map((h) => `#include <${h}>`),
      "struct Shape { virtual ~Shape() = default; virtual double area() const = 0; };",
    ].join("\n"),
    struct: (e) => `struct ${pascal(e.s)} {\n${e.fields.map((f) => `    ${cppField(f)};`).join("\n")}\n};`,
  },
];

let problems = 0;
const missing: string[] = [];
for (const t of TARGETS) {
  if (!has(t.compiler)) {
    missing.push(t.compiler);
    console.log(`${t.lang}: SALTEADO, falta ${t.compiler}`);
    continue;
  }
  // un archivo por fragmento distinto; se agrupan para compilar varios por llamada
  const seen = new Set<string>();
  const sources: { concept: string; text: string; file: string }[] = [];
  const rng = makeRng(7);
  for (const concept of CONCEPTS) {
    const impl = IMPLS[t.lang][concept.id];
    if (!impl) continue;
    for (const ent of ENTITIES) {
      for (let k = 0; k < 2; k++) {
        const ctx: FullCtx = { ...makeCtx(rng, ent), enumSet: ENUM_SETS[k % ENUM_SETS.length], shape: SHAPES[k % SHAPES.length] };
        const out = impl(ctx);
        for (const text of Array.isArray(out) ? out : [out]) {
          if (seen.has(text)) continue;
          seen.add(text);
          const file = join(dir, `${t.lang}-${sources.length}.${t.ext}`);
          // classDef declara el tipo; el resto lo necesita declarado arriba
          writeFileSync(file, `${t.prelude}\n${concept.id === "classDef" ? "" : t.struct(ent)}\n\n${text}\n`);
          sources.push({ concept: concept.id, text, file });
        }
      }
    }
  }
  let bad = 0;
  for (const s of sources) {
    // -c en vez de -fsyntax-only: algunos envoltorios de compilador (zig cc) fallan con -fsyntax-only
    const r = spawnSync(t.compiler, [...t.flags, "-Wall", "-Wextra", "-Werror", "-Wno-unused-function", "-c", "-o", `${s.file}.o`, s.file], { encoding: "utf8" });
    if (r.status === 0) continue;
    bad++;
    problems++;
    if (bad <= 5) {
      const err = (r.stderr || r.stdout).split("\n").filter((l) => /error/.test(l)).slice(0, 2).join("\n");
      console.log(`✗ [${t.lang}] ${s.concept}\n${s.text}\n${err}\n`);
    }
  }
  console.log(`${t.lang}: ${sources.length - bad}/${sources.length} fragmentos compilan`);
}
rmSync(dir, { recursive: true, force: true });

if (missing.length && strict) {
  console.log(`Faltan compiladores (${missing.join(", ")}) y EJEMPLOS_ESTRICTO=1`);
  problems++;
}
console.log(problems ? `\nPROBLEMAS: ${problems}` : "\nTodo el código generado compila");
process.exit(problems ? 1 : 0);
