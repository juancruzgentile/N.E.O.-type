// Revisa la sintaxis de los ejemplos de la Biblioteca con el parser de cada lenguaje.
//
// Los ejemplos son fragmentos: usan variables que no se declaran y mezclan declaraciones con sentencias, así que no
// se compilan; se comprueba que estén bien escritos. Cada revisor prueba algunas "envolturas" (como archivo, dentro
// de una función…) y el ejemplo pasa si alguna funciona.
//
// Si falta la herramienta de un revisor (go, javac, rustfmt, dotnet…), esos ejemplos se saltean con un aviso. Con
// EJEMPLOS_ESTRICTO=1 (lo usa el CI) que falte una herramienta es un error.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { transformSync } from "esbuild";
import ts from "typescript";
import { ALL_TOPICS as TOPICS } from "../src/library/unlock";
import { entryId } from "../src/library/search";
import type { Entry } from "../src/library/types";

const strict = process.env.EJEMPLOS_ESTRICTO === "1";
const tmp = mkdtempSync(join(tmpdir(), "neo-ejemplos-"));

const has = (cmd: string) => spawnSync("sh", ["-c", `command -v ${cmd}`]).status === 0;
const run = (cmd: string, args: string[], input?: string, cwd?: string) => {
  const r = spawnSync(cmd, args, { input, encoding: "utf8", cwd, maxBuffer: 64 << 20 });
  return { ok: r.status === 0, out: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim() };
};
const firstLine = (s: string) => s.split("\n").find((l) => l.trim())?.trim() ?? "error sin mensaje";
const pyHas = (mod: string) => has("python3") && run("python3", ["-c", `import ${mod}`]).ok;

/** null = bien escrito; texto = el error */
type Result = string | null;

/** Prueba variantes del ejemplo: pasa si alguna funciona; si no, devuelve el error de la primera. */
const anyOf = (variants: string[], test: (src: string) => Result): Result => {
  let first: Result = null;
  for (const v of variants) {
    const err = test(v);
    if (!err) return null;
    first ??= err;
  }
  return first;
};

interface Checker {
  name: string;
  /** está disponible en esta máquina; si no, devuelve qué falta */
  missing: () => string | null;
  /** revisa varios ejemplos a la vez (los que necesitan levantar un proceso caro van en lote) */
  check: (codes: string[]) => Result[];
  /** un ejemplo roto que tiene que rechazar: prueba que el revisor no aprueba cualquier cosa */
  broken: string;
}
const each = (f: (code: string) => Result) => (codes: string[]) => codes.map(f);
const needs = (...tools: string[]) => () => tools.find((t) => !has(t)) ?? null;

/**
 * Formas de separar un fragmento en "declaraciones" y "código que las usa": se corta en cada llave de cierre en la
 * columna 0, y el código puede ir antes o después de las declaraciones. Devuelve pares [declaraciones, código].
 */
const splits = (lines: string[]): [string, string][] => {
  const cuts = lines.map((l, i) => (/^\};?$/.test(l) ? i : -1)).filter((i) => i >= 0);
  const out: [string, string][] = [];
  for (const cut of cuts) {
    out.push([lines.slice(0, cut + 1).join("\n"), lines.slice(cut + 1).join("\n")]);
    // código arriba y declaración abajo: la declaración empieza en la primera línea en la columna 0 antes del corte
    const start = lines.slice(0, cut).findLastIndex((l, i) => /^\S/.test(l) && (i === 0 || lines[i - 1].trim() === ""));
    if (start > 0) out.push([lines.slice(start, cut + 1).join("\n"), [...lines.slice(0, start), ...lines.slice(cut + 1)].join("\n")]);
  }
  return out;
};

// ── Python: ast.parse, en un solo proceso ──
const python: Checker = {
  name: "Python",
  missing: needs("python3"),
  broken: "def f(:\n    pass",
  check: (codes) => {
    const helper = String.raw`
import ast, json, sys, textwrap
res = []
for code in json.load(sys.stdin):
    err = None
    for src in (code, "async def _():\n" + textwrap.indent(code, "    ")):
        try:
            ast.parse(src)
            err = None
            break
        except SyntaxError as e:
            err = err or f"línea {e.lineno}: {e.msg}"
    res.append(err)
print(json.dumps(res))
`;
    const r = run("python3", ["-c", helper], JSON.stringify(codes));
    if (!r.ok) throw new Error(r.out);
    return JSON.parse(r.out);
  },
};

// ── JavaScript y TypeScript: errores de sintaxis del compilador de TypeScript ──
const tsChecker = (name: string, fileName: string): Checker => ({
  name,
  missing: () => null,
  broken: "function f( {",
  check: each((code) =>
    anyOf([code, `async function _() {\n${code}\n}`], (src) => {
      const out = ts.transpileModule(src, { fileName, reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ESNext } });
      const d = out.diagnostics?.[0];
      if (!d) return null;
      const line = d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start).line + 1 : 1;
      return `línea ${line}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`;
    }),
  ),
});

const javascript = tsChecker("JavaScript", "ejemplo.js");
const typescript = tsChecker("TypeScript", "ejemplo.ts");
const tsx = tsChecker("React (TSX)", "ejemplo.tsx");

// ── Go: gofmt -e (solo parsea). Las declaraciones van arriba y el resto dentro de una función ──
const goSplit = (code: string) => {
  const decls: string[] = [];
  const body: string[] = [];
  let inDecl = false;
  for (const line of code.split("\n")) {
    if (/^(type|func|import|const|var) /.test(line) && !/^(var|const) \w+ *:?=/.test(line)) inDecl = true;
    else if (/^\S/.test(line) && !/^[})\]]/.test(line)) inDecl = false;
    (inDecl ? decls : body).push(line);
    if (inDecl && /^[})]/.test(line)) inDecl = false;
  }
  return `package ejemplo\n\n${decls.join("\n")}\n\nfunc _() {\n${body.join("\n")}\n}\n`;
};
const go: Checker = {
  name: "Go",
  missing: needs("gofmt"),
  broken: "func f( {",
  check: each((code) =>
    anyOf(
      [code.startsWith("package ") ? code : `package ejemplo\n\n${code}\n`, `package ejemplo\n\nfunc _() {\n${code}\n}\n`, goSplit(code)],
      (src) => {
        const r = run("gofmt", ["-e"], src);
        return r.ok ? null : firstLine(r.out.replace(/^<standard input>:/gm, "línea "));
      },
    ),
  ),
};

// ── Terminal: bash -n. Los <marcadores> de la documentación pasan a ser una palabra ──
const shellOne = (code: string): Result => {
  const r = run("bash", ["-n"], code.replace(/<([\w.-]+)>/g, "$1"));
  return r.ok ? null : firstLine(r.out.replace(/^bash: (línea|line)/gm, "línea"));
};
const shell: Checker = { name: "bash", missing: needs("bash"), broken: "if [ -f x ]; then echo", check: each(shellOne) };

// ── Rust: rustfmt también parsea; se prueba como archivo y dentro de una función ──
const rust: Checker = {
  name: "Rust",
  missing: needs("rustfmt"),
  broken: "fn f( {",
  check: each((code) =>
    anyOf([code, `fn _f() {\n${code}\n}`], (src) => {
      const f = join(tmp, "ejemplo.rs");
      writeFileSync(f, src);
      const r = run("rustfmt", ["--edition", "2024", "--check", f]);
      // --check sale con 1 si cambiaría el formato; solo cuenta si hay un error de sintaxis
      return r.ok || !/^error/m.test(r.out) ? null : firstLine(r.out.slice(r.out.search(/^error/m)).replace(/^error(\[\w+\])?: /, ""));
    }),
  ),
};

// ── Java: javac que se detiene después de parsear (no busca clases ni tipos) ──
const javaVariants = (code: string) => {
  const imports = code.split("\n").filter((l) => /^(import|package) /.test(l)).join("\n");
  const rest = code.split("\n").filter((l) => !/^(import|package) /.test(l)).join("\n");
  return [
    code,
    `${imports}\nclass Ejemplo {\n${rest}\n}`,
    `${imports}\nclass Ejemplo {\nvoid ejemplo() throws Exception {\n${rest}\n}\n}`,
    ...splits(rest.split("\n")).map(([decls, body]) => `${imports}\nclass Ejemplo {\n${decls}\nvoid ejemplo() throws Exception {\n${body}\n}\n}`),
  ];
};
const java: Checker = {
  name: "Java",
  missing: needs("javac"),
  broken: "class A { void f( { } }",
  check: each((code) =>
    anyOf(javaVariants(code), (src) => {
      const f = join(tmp, "Ejemplo.java");
      writeFileSync(f, src);
      const r = run("javac", ["-XDshould-stop.ifNoError=PARSE", "-XDshould-stop.ifError=PARSE", "-d", tmp, f]);
      return r.ok ? null : firstLine(r.out.replace(f, "").replace(/^:/, "línea "));
    }),
  ),
};

// ── C#: Roslyn en modo script (acepta sentencias y declaraciones mezcladas), en un solo proceso ──
const csharp: Checker = {
  name: "C#",
  missing: () => (has("dotnet") ? null : "dotnet"),
  broken: "void F( { }",
  check: (codes) => {
    const r = run("dotnet", ["run", resolve("scripts/csharp-sintaxis.cs")], codes.join("\0"));
    if (!r.ok) throw new Error(r.out);
    const lines = r.out.split("\n").filter((l) => l.startsWith("OK") || l.startsWith("ERROR"));
    if (lines.length !== codes.length) throw new Error(`el revisor de C# devolvió ${lines.length} resultados para ${codes.length} ejemplos:\n${r.out}`);
    return lines.map((l) => (l.startsWith("OK") ? null : l.slice("ERROR ".length)));
  },
};

// ── C y C++: se compila y solo cuentan los errores de sintaxis (los fragmentos usan variables sin declarar) ──
const SYNTAX_ERROR = /error: (expected|stray|missing terminating|unterminated|extraneous|expected expression|function definition is not allowed)/;
const cVariants = (code: string, lang: "c" | "cpp") => {
  const lines = code.split("\n");
  // en C++ hace falta saber qué nombres son tipos para poder parsear: se incluyen los headers estándar de uso común
  const std = lang === "c"
    ? ["stdio.h", "stdlib.h", "string.h", "stdbool.h", "stddef.h", "errno.h", "ctype.h"]
    : ["algorithm", "concepts", "format", "iostream", "map", "memory", "optional", "ranges", "stdexcept", "string", "unordered_map", "vector"];
  const pre = [...std.map((h) => `#include <${h}>`), ...lines.filter((l) => l.startsWith("#"))].join("\n");
  const rest = lines.filter((l) => !l.startsWith("#"));
  const fn = lang === "c" ? "void ejemplo_(void)" : "void ejemplo_()";
  return [
    `${pre}\n${rest.join("\n")}`,
    `${pre}\n${fn}\n{\n${rest.join("\n")}\n}`,
    ...splits(rest).map(([decls, body]) => `${pre}\n${decls}\n${fn}\n{\n${body}\n}`),
  ];
};
const cFamily = (lang: "c" | "cpp"): Checker => {
  const compiler = lang === "c" ? "gcc" : "g++";
  return {
    name: lang === "c" ? "C" : "C++",
    missing: needs(compiler),
    broken: "int f( { }",
    check: each((code) =>
      anyOf(cVariants(code, lang), (src) => {
        const f = join(tmp, lang === "c" ? "ejemplo.c" : "ejemplo.cpp");
        writeFileSync(f, src);
        // -c en vez de -fsyntax-only: algunos envoltorios de compilador (zig cc) fallan con -fsyntax-only
        const r = run(compiler, [lang === "c" ? "-std=c17" : "-std=c++20", "-w", "-c", "-o", join(tmp, "ejemplo.o"), f]);
        if (r.ok) return null;
        const err = r.out.split("\n").find((l) => SYNTAX_ERROR.test(l));
        return err ? err.slice(err.indexOf(f) + f.length).replace(/^:(\d+):\d+: error: /, "línea $1: ") : null;
      }),
    ),
  };
};
const cLang = cFamily("c");
const cppLang = cFamily("cpp");

// ── Swift: swiftc -parse solo parsea; un main.swift acepta sentencias sueltas ──
const swift: Checker = {
  name: "Swift",
  missing: needs("swiftc"),
  broken: "func f( {",
  check: each((code) => {
    const f = join(tmp, "main.swift");
    writeFileSync(f, code);
    const r = run("swiftc", ["-parse", f]);
    if (r.ok) return null;
    const err = r.out.split("\n").find((l) => /error:/.test(l)) ?? r.out;
    return err.slice(err.indexOf(f) + f.length).replace(/^:(\d+):\d+: error: /, "línea $1: ");
  }),
};

// ── Kotlin: kotlinc compila; solo cuentan los errores de sintaxis (los fragmentos usan nombres sin declarar) ──
const KOTLIN_SYNTAX = /error: (expecting|unexpected tokens?|unclosed|incomplete code|syntax error)/i;
const kotlin: Checker = {
  name: "Kotlin",
  missing: needs("kotlinc"),
  broken: "fun f( {",
  check: each((code) =>
    anyOf([code, `fun ejemplo() {\n${code}\n}`, ...splits(code.split("\n")).map(([decls, body]) => `${decls}\nfun ejemplo() {\n${body}\n}`)], (src) => {
      const f = join(tmp, "ejemplo.kt");
      writeFileSync(f, src);
      const r = run("kotlinc", [f, "-d", join(tmp, "kt"), "-nowarn"]);
      const err = r.out.split("\n").find((l) => KOTLIN_SYNTAX.test(l));
      return err ? err.slice(err.indexOf(f) + f.length).replace(/^:(\d+):\d+: error: /, "línea $1: ") : null;
    }),
  ),
};

// ── PHP: php -l. Si el ejemplo no abre <?php (ni es una plantilla HTML), se le agrega ──
const php: Checker = {
  name: "PHP",
  missing: needs("php"),
  broken: "<?php function f( {",
  check: each((code) => {
    const f = join(tmp, "ejemplo.php");
    writeFileSync(f, code.startsWith("<") ? code : `<?php\n${code}`);
    const r = run("php", ["-l", "-d", "display_errors=stdout", f]);
    if (r.ok) return null;
    const err = r.out.split("\n").find((l) => /error/i.test(l)) ?? r.out;
    return err.replace(` in ${f}`, "").replace(/^PHP /, "");
  }),
};

// ── CSS: el parser de esbuild ──
const css: Checker = {
  name: "CSS",
  missing: () => null,
  broken: ".a { color: red;\n.b { }",
  check: each((code) => {
    try {
      const out = transformSync(code, { loader: "css", logLevel: "silent" });
      const w = out.warnings.find((x) => /expected|unexpected/i.test(x.text));
      return w ? `línea ${w.location?.line ?? 1}: ${w.text}` : null;
    } catch (e) {
      const err = (e as { errors?: { text: string; location?: { line: number } }[] }).errors?.[0];
      return err ? `línea ${err.location?.line ?? 1}: ${err.text}` : String(e);
    }
  }),
};

// ── HTML: que cada etiqueta que se abre se cierre en orden (html.parser de Python) ──
const html: Checker = {
  name: "HTML",
  missing: needs("python3"),
  broken: "<ul>\n  <li>uno</ul>\n</li>",
  check: (codes) => {
    const helper = String.raw`
import json, sys
from html.parser import HTMLParser
VOID = {"area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr","!doctype"}
OPTIONAL = {"li","p","td","th","tr","option","dt","dd","thead","tbody","tfoot"}
class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack, self.err = [], None
    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append((tag, self.getpos()[0]))
    def handle_endtag(self, tag):
        if self.err or tag in VOID:
            return
        while self.stack and self.stack[-1][0] != tag and self.stack[-1][0] in OPTIONAL:
            self.stack.pop()
        if not self.stack or self.stack[-1][0] != tag:
            self.err = f"línea {self.getpos()[0]}: </{tag}> no cierra la última etiqueta abierta"
        else:
            self.stack.pop()
res = []
for code in json.load(sys.stdin):
    p = P()
    p.feed(code)
    p.close()
    left = [t for t in p.stack if t[0] not in OPTIONAL]
    res.append(p.err or (f"línea {left[-1][1]}: <{left[-1][0]}> sin cerrar" if left else None))
print(json.dumps(res))
`;
    const r = run("python3", ["-c", helper], JSON.stringify(codes));
    if (!r.ok) throw new Error(r.out);
    return JSON.parse(r.out);
  },
};

// ── Formatos: cada ejemplo con lo suyo (JSON, YAML, TOML o comandos); el resto no tiene revisor ──
const pyParse = (mod: string, call: string): Checker => ({
  name: mod,
  missing: () => (pyHas(mod) ? null : `python3 con ${mod}`),
  broken: mod === "yaml" ? "a: [1, 2\nb: 3" : "[a\nb = 1",
  check: each((code) => {
    const r = run("python3", ["-c", `import sys, ${mod}\n${call}`], code);
    return r.ok ? null : firstLine(r.out.split("\n").slice(-3).join("\n"));
  }),
});
const json: Checker = {
  name: "JSON",
  missing: () => null,
  broken: '{"a": 1,}',
  check: each((code) => {
    try {
      JSON.parse(code);
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  }),
};
const yaml = pyParse("yaml", "list(yaml.safe_load_all(sys.stdin))");
const toml = pyParse("tomllib", "tomllib.loads(sys.stdin.read())");

/** Ejemplos que son comandos de terminal dentro de un tema de lenguaje (pip, npx tsc, go mod, cargo…). */
const SHELL_COMMAND = /^(python3? -m|pip|uv|npm|npx|node|deno|bun|go (mod|get|build|run|test|vet|install|work)|gofmt|cargo|rustc|rustup|javac|java -|mvn|gradle|\.\/gradlew|dotnet|tsc|jq|gcc|g\+\+|clang|cmake|ctest|valgrind|make|swift (package|build|test|run)|\.\/gradlew|composer|fastapi (dev|run)|django-admin|python3? manage\.py|\.\/mvnw)(?=\s|$)/;

/** Qué revisor le toca a cada ejemplo, o null si no tiene revisión automática. */
function checkerFor(topic: string, e: Entry): Checker | null {
  if (SHELL_COMMAND.test(e.code.trimStart())) return shell;
  switch (topic) {
    case "python":
    case "fastapi":
    case "django": return python;
    case "react": return tsx;
    case "spring": return java;
    case "aspnet": return csharp;
    case "javascript": return javascript;
    case "typescript": return typescript;
    case "go": return go;
    case "c": return cLang;
    case "cpp": return cppLang;
    case "swift": return swift;
    case "kotlin": return kotlin;
    case "php": return php;
    case "rust": return rust;
    case "java": return java;
    case "csharp": return csharp;
    case "css": return css;
    case "html": return html;
    case "linux":
    case "git": return shell;
    case "formats":
      if (/^JSON/.test(e.name)) return json;
      if (/YAML|docker-compose|GitHub Actions/.test(e.name)) return yaml;
      if (e.name === "TOML") return toml;
      return null;
    default: return null;
  }
}

// ── revisión ──
let problems = 0;
let skipped = 0;
const missingTools = new Set<string>();
const groups = new Map<Checker, { topic: string; e: Entry }[]>();
const perTopic = new Map<string, { ok: number; bad: number; skip: number; none: number }>();
const tally = (topic: string) => perTopic.get(topic) ?? (perTopic.set(topic, { ok: 0, bad: 0, skip: 0, none: 0 }), perTopic.get(topic)!);

for (const topic of TOPICS) {
  tally(topic.name); // el resumen sale en el orden de la Biblioteca
  for (const e of topic.entries) {
    const c = checkerFor(topic.id, e);
    if (!c) {
      tally(topic.name).none++;
      continue;
    }
    const list = groups.get(c) ?? [];
    list.push({ topic: topic.name, e });
    groups.set(c, list);
  }
}

const tested = new Set<string>();
for (const [c, items] of groups) {
  const lack = c.missing();
  if (lack) {
    missingTools.add(lack);
    for (const { topic } of items) tally(topic).skip++;
    skipped += items.length;
    continue;
  }
  if (!tested.has(c.name)) {
    tested.add(c.name);
    if (!c.check([c.broken])[0]) {
      problems++;
      console.log(`✗ el revisor de ${c.name} aceptó un ejemplo roto: no está revisando nada`);
    }
  }
  const results = c.check(items.map((x) => x.e.code));
  items.forEach(({ topic, e }, i) => {
    const t = TOPICS.find((x) => x.name === topic)!;
    if (results[i]) {
      problems++;
      tally(topic).bad++;
      console.log(`✗ [${topic}] ${e.name} (${entryId(t, e)}): ${results[i]}`);
    } else tally(topic).ok++;
  });
}
rmSync(tmp, { recursive: true, force: true });

console.log("");
for (const [topic, t] of perTopic) {
  const parts = [`${t.ok} bien`];
  if (t.bad) parts.push(`${t.bad} con errores`);
  if (t.skip) parts.push(`${t.skip} salteados`);
  if (t.none) parts.push(`${t.none} sin revisor`);
  console.log(`${topic.padEnd(22)} ${parts.join(" · ")}`);
}
if (missingTools.size) {
  console.log(`\nSalteados ${skipped} ejemplos porque falta: ${[...missingTools].join(", ")}`);
  if (strict) {
    console.log("Con EJEMPLOS_ESTRICTO=1 tienen que estar todas las herramientas");
    problems++;
  }
}
console.log(problems ? `\nPROBLEMAS: ${problems}` : "\nTodos los ejemplos revisados están bien escritos");
process.exit(problems ? 1 : 0);
