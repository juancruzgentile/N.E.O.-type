// Compila (y cuando se puede, ejecuta y prueba) el código de los proyectos, para asegurar que lo que se escribe
// en la app funciona de verdad. Cada proyecto se copia a una carpeta temporal tal como se escribe.
//
// Si falta una herramienta (javac, dotnet, cargo…), ese paso se saltea con un aviso. Con EJEMPLOS_ESTRICTO=1
// (lo usa el CI) que falte una herramienta es un error.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { transformSync } from "esbuild";
import { PROJECTS } from "../src/projects/projects";

const strict = process.env.EJEMPLOS_ESTRICTO === "1";
const root = mkdtempSync(join(tmpdir(), "neo-proyectos-"));
// entre comillas: la carpeta del proyecto puede tener espacios
const tsc = JSON.stringify(resolve("node_modules/.bin/tsc"));
const py = process.env.PYTHON ?? "python3";

const sh = (cmd: string, cwd = root) => {
  const r = spawnSync("sh", ["-c", cmd], { cwd, encoding: "utf8", maxBuffer: 64 << 20, env: { ...process.env, DOTNET_CLI_TELEMETRY_OPTOUT: "1", DOTNET_NOLOGO: "1" } });
  return { ok: r.status === 0, out: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim() };
};
const hasCmd = (c: string) => sh(`command -v ${c}`).ok;
const hasPy = (m: string) => sh(`${py} -c "import ${m}"`).ok;
/** "py:modulo" es un módulo de Python; lo demás, un comando */
const missingOf = (tools: string[]) => tools.filter((t) => (t.startsWith("py:") ? !hasPy(t.slice(3)) : !hasCmd(t)));

interface Step {
  desc: string;
  tools: string[];
  cmd: string;
}
const step = (desc: string, tools: string[], cmd: string): Step => ({ desc, tools, cmd });
const yamlOk = (file: string) => step(`${file} es YAML válido`, [py, "py:yaml"], `${py} -c "import sys, yaml; list(yaml.safe_load_all(open(sys.argv[1])))" ${file}`);

/** Lo que se prueba en cada proyecto. Archivos de apoyo que no se escriben en la app van en `extra`. */
const PLAN: Record<string, { steps: Step[]; extra?: Record<string, string> }> = {
  p01: { steps: [step("calcula la propina", [py], `printf '100\\n10\\n2\\n' | ${py} propinas.py | grep -q 'Cada persona paga: 55.00'`)] },
  p02: { steps: [step("sintaxis de JavaScript", ["node"], "node --check tareas.js")] },
  p03: { steps: [] }, // el CSS se revisa abajo con esbuild
  p04: { steps: [step("compila", [py], `${py} -m py_compile agenda.py`)] },
  p05: { steps: [step("tipos de TypeScript", [], `${tsc} --noEmit --strict --target es2022 --module esnext --moduleResolution bundler tipos.ts inventario.ts`)] },
  p06: { steps: [step("go vet y go build", ["go"], "go vet ./... && go build -o /dev/null .")] },
  p07: {
    steps: [
      step("compila", [py], `${py} -m py_compile biblioteca.py`),
      step("el esquema carga en SQLite", [py], `${py} -c "import sqlite3; sqlite3.connect(':memory:').executescript(open('schema.sql').read())"`),
    ],
  },
  p08: {
    extra: { "Cargo.toml": '[package]\nname = "gastos"\nversion = "0.1.0"\nedition = "2024"\n' },
    steps: [step("cargo build", ["cargo"], "cargo build --quiet")],
  },
  p09: { steps: [step("javac", ["javac"], "javac -d clases *.java")] },
  p11: {
    steps: [
      step("dotnet build", ["dotnet"], "dotnet build --nologo -v q"),
      step(
        "agregar, buscar, resumen y exportar",
        ["dotnet"],
        "dotnet run --no-build -- agregar Compras 'pan y leche' alta && dotnet run --no-build -- agregar Idea 'app de notas' " +
          "&& dotnet run --no-build -- buscar PAN | grep -q '1 nota' && dotnet run --no-build -- resumen | grep -q Alta " +
          "&& dotnet run --no-build -- exportar && grep -q '## Alta (1)' notas.md && dotnet run --no-build -- borrar 1 | grep -q borrada",
      ),
    ],
  },
  p12: { steps: [step("pytest", [py, "py:fastapi", "py:httpx2", "py:pytest"], `${py} -m pytest -q -p no:cacheprovider`)] },
  p13: { steps: [step("probar.sh", ["bash", "tar", "sha256sum"], "bash probar.sh"), step("Makefile", ["make", "bash"], "make -s probar")] },
  p14: {
    steps: [
      step("pytest", [py, "py:fastapi", "py:httpx2", "py:pytest"], `${py} -m pytest -q -p no:cacheprovider`),
      yamlOk("docker-compose.yml"),
    ],
  },
  p10: {
    steps: [
      step("la API compila", [py], `${py} -m py_compile api/main.py`),
      step("tipos del front-end", [], `${tsc} --noEmit --strict --target es2022 --lib es2022,dom web/app.ts`),
      step("el Makefile se entiende", ["make"], "make -n dev web db clean > /dev/null"),
      yamlOk("docker-compose.yml"),
    ],
  },
};

let problems = 0;
const missingTools = new Set<string>();
for (const p of PROJECTS) {
  const dir = join(root, p.id);
  for (const f of p.files) {
    mkdirSync(dirname(join(dir, f.name)), { recursive: true });
    writeFileSync(join(dir, f.name), f.text + "\n");
  }
  const plan = PLAN[p.id];
  if (!plan) {
    problems++;
    console.log(`✗ proyecto ${p.num} (${p.id}): no tiene plan de prueba en scripts/check-projects.ts`);
    continue;
  }
  for (const [name, text] of Object.entries(plan.extra ?? {})) writeFileSync(join(dir, name), text);

  const done: string[] = [];
  for (const f of p.files.filter((x) => x.lang === "css")) {
    try {
      transformSync(readFileSync(join(dir, f.name), "utf8"), { loader: "css", logLevel: "silent" });
      done.push(`${f.name} bien escrito`);
    } catch (e) {
      problems++;
      console.log(`✗ proyecto ${p.num} ${f.name}: ${String(e).split("\n")[0]}`);
    }
  }
  for (const s of plan.steps) {
    const lack = missingOf(s.tools);
    if (lack.length) {
      lack.forEach((t) => missingTools.add(t));
      done.push(`${s.desc} (salteado: falta ${lack.join(", ")})`);
      continue;
    }
    const r = sh(s.cmd, dir);
    if (r.ok) done.push(s.desc);
    else {
      problems++;
      console.log(`✗ proyecto ${p.num} (${p.title}) · ${s.desc}\n${r.out.split("\n").slice(-15).join("\n")}`);
    }
  }
  console.log(`proyecto ${String(p.num).padStart(2)} ${p.title.padEnd(38)} ${done.join(" · ") || "sin pasos automáticos"}`);
}
rmSync(root, { recursive: true, force: true });

if (missingTools.size) {
  console.log(`\nFaltan herramientas: ${[...missingTools].join(", ")}`);
  if (strict) {
    console.log("Con EJEMPLOS_ESTRICTO=1 tienen que estar todas");
    problems++;
  }
}
console.log(problems ? `\nPROBLEMAS: ${problems}` : "\nTodos los proyectos que se pudieron probar funcionan");
process.exit(problems ? 1 : 0);
