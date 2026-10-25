// Ruta de formatos de archivo que aparecen en todo proyecto:
// .env → requirements.txt → JSON → package.json → YAML → Markdown.
// Las versiones son ejemplos de formato (no recomendaciones de qué versión instalar).

import { ENTITIES, type Rng, camel, chance, int, pick, snake, un } from "../gen/base";
import type { Exercise, Topic, Track } from "./types";

const L = (...lines: string[]) => lines.join("\n");
const ex = (title: string, ...lines: string[]): Exercise => ({ title, text: L(...lines) });
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const APPS = ["shop-api", "neo-type", "blog", "task-board", "weather-bot", "crm", "chat-server"];
const NAMES = ["Ana", "Bruno", "Carla", "Diego", "Elena", "Franco", "Lucia", "Marco"];
const CITIES = ["Torino", "Rosario", "Madrid", "Milano", "Cordoba"];
const ver = (rng: Rng, maj: [number, number]) => `${int(rng, maj[0], maj[1])}.${int(rng, 0, 12)}.${int(rng, 0, 9)}`;
const hex = (rng: Rng, n: number) => Array.from({ length: n }, () => "0123456789abcdef"[int(rng, 0, 15)]).join("");

// ─────────────────────────── .env ───────────────────────────

const envFile: Topic = {
  id: "env",
  gen(rng) {
    const app = pick(rng, APPS);
    const db = snake({ w: app.split("-") });
    const prod = chance(rng, 0.5);
    const lines = [
      "# Server",
      `PORT=${pick(rng, [3000, 8000, 8080, 5000])}`,
      `NODE_ENV=${prod ? "production" : "development"}`,
      `DEBUG=${prod ? "false" : "true"}`,
      "",
      "# Database",
      pick(rng, [
        `DATABASE_URL=postgresql://${db}:${hex(rng, 8)}@localhost:5432/${db}`,
        `DATABASE_URL=mysql://root:${hex(rng, 8)}@127.0.0.1:3306/${db}`,
        `DATABASE_URL=sqlite:///./${db}.db`,
      ]),
    ];
    if (chance(rng, 0.6)) lines.push(`REDIS_URL=redis://localhost:6379/${int(rng, 0, 3)}`);
    if (chance(rng, 0.6)) lines.push("", "# Secrets", `SECRET_KEY=${hex(rng, 24)}`, `API_KEY="sk_test_${hex(rng, 16)}"`);
    if (chance(rng, 0.4)) lines.push(`ALLOWED_HOSTS=localhost,127.0.0.1,${app}.example.com`);
    return ex(`Variables de entorno de ${app} para ${prod ? "producción" : "desarrollo"}`, ...lines);
  },
};

// ─────────────────────────── requirements.txt ───────────────────────────

const PY_STACKS = [
  { es: "una API con FastAPI", pkgs: ["fastapi", "uvicorn[standard]", "pydantic", "sqlalchemy", "alembic", "python-dotenv"] },
  { es: "un proyecto Django", pkgs: ["django", "djangorestframework", "psycopg[binary]", "gunicorn", "whitenoise"] },
  { es: "un análisis de datos", pkgs: ["pandas", "numpy", "matplotlib", "scikit-learn", "jupyterlab"] },
  { es: "un bot de Telegram", pkgs: ["python-telegram-bot", "httpx", "python-dotenv", "apscheduler"] },
  { es: "una app Flask", pkgs: ["flask", "flask-sqlalchemy", "flask-login", "gunicorn"] },
];

const requirements: Topic = {
  id: "requirements",
  gen(rng) {
    const st = pick(rng, PY_STACKS);
    const lines = st.pkgs.map((p) => {
      const v = ver(rng, [0, 5]);
      return pick(rng, [`${p}==${v}`, `${p}>=${v}`, `${p}>=${v},<${int(rng, 6, 9)}.0`, `${p}~=${v}`]);
    });
    if (chance(rng, 0.4)) lines.unshift("-r base.txt");
    if (chance(rng, 0.5)) lines.push("", "# tests", `pytest==${ver(rng, [7, 8])}`, `pytest-cov>=${ver(rng, [4, 6])}`);
    return ex(`requirements.txt de ${st.es}`, ...lines);
  },
};

// ─────────────────────────── JSON ───────────────────────────

/** valor JSON de ejemplo para un campo de una entidad */
const NAME_BY_ENTITY: Record<string, string[]> = {
  city: CITIES,
  product: ["Keyboard", "Monitor", "Mouse"],
  dish: ["Pizza", "Ramen", "Empanada"],
  document: ["report", "invoice", "backup"],
  course: ["Python 101", "SQL Basics", "Docker"],
};

function jsonVal(rng: Rng, t: string, field: string, ent: string): string {
  if (t === "bool") return String(chance(rng, 0.6));
  if (t === "int") return String(int(rng, 1, 500));
  if (t === "float") return `${int(rng, 1, 400)}.${int(rng, 10, 99)}`;
  if (field === "name") return `"${pick(rng, NAME_BY_ENTITY[ent] ?? NAMES)}"`;
  if (field === "email") return `"${pick(rng, NAMES).toLowerCase()}@example.com"`;
  return `"${pick(rng, ["alpha", "bravo", "delta", "omega", "A-102", "X-900"])}"`;
}

const jsonObject: Topic = {
  id: "json-object",
  gen(rng) {
    const ent = pick(rng, ENTITIES);
    const fields = ent.fields.map((f) => `  "${camel(f.n)}": ${jsonVal(rng, f.t, f.n.w.join(" "), ent.s.w.join(" "))}`);
    const extra = pick(rng, [
      `  "tags": ["${pick(rng, ["new", "vip", "beta"])}", "${pick(rng, ["sale", "featured", "archived"])}"]`,
      `  "address": { "city": "${pick(rng, CITIES)}", "zip": "${int(rng, 10000, 99999)}" }`,
      `  "createdAt": "2026-${String(int(rng, 1, 12)).padStart(2, "0")}-${String(int(rng, 1, 28)).padStart(2, "0")}T10:30:00Z"`,
      `  "notes": null`,
    ]);
    const lines = [`  "id": ${int(rng, 1, 9999)}`, ...fields, extra];
    return ex(`JSON de ${un(ent.g)} ${ent.es}`, "{", ...lines.map((l, i) => l + (i < lines.length - 1 ? "," : "")), "}");
  },
};

const jsonArray: Topic = {
  id: "json-array",
  gen(rng) {
    const n = int(rng, 2, 3);
    const items = Array.from({ length: n }, (_, i) => {
      const name = NAMES[(i + int(rng, 0, 7)) % NAMES.length];
      return `    { "id": ${i + 1}, "name": "${name}", "active": ${chance(rng, 0.7)} }`;
    });
    return ex(
      "Respuesta de una API con paginación y una lista de usuarios",
      "{",
      `  "page": ${int(rng, 1, 9)},`,
      `  "total": ${int(rng, 10, 300)},`,
      `  "data": [`,
      ...items.map((l, i) => l + (i < items.length - 1 ? "," : "")),
      "  ]",
      "}",
    );
  },
};

// ─────────────────────────── package.json ───────────────────────────

const JS_STACKS = [
  { es: "React con Vite", dev: "vite", build: "tsc -b && vite build", deps: ["react", "react-dom"], devDeps: ["vite", "typescript", "@vitejs/plugin-react"] },
  { es: "una API con Express", dev: "node --watch src/server.js", build: "", deps: ["express", "cors", "dotenv"], devDeps: ["eslint", "vitest"] },
  { es: "Next.js", dev: "next dev", build: "next build", deps: ["next", "react", "react-dom"], devDeps: ["typescript", "eslint"] },
  { es: "un CLI con Node", dev: "tsx src/index.ts", build: "tsc", deps: ["commander", "chalk"], devDeps: ["typescript", "tsx"] },
];

const packageJson: Topic = {
  id: "package-json",
  gen(rng) {
    const st = pick(rng, JS_STACKS);
    const app = pick(rng, APPS);
    const dep = (p: string) => `"${p}": "${pick(rng, ["^", "~", ""])}${ver(rng, [1, 19])}"`;
    const list = (ps: string[]) => ps.map((p, i) => `    ${dep(p)}${i < ps.length - 1 ? "," : ""}`);
    const scripts = [`"dev": "${st.dev}"`, ...(st.build ? [`"build": "${st.build}"`] : []), `"test": "vitest run"`, `"lint": "eslint ."`];
    return ex(
      `package.json de ${st.es}`,
      "{",
      `  "name": "${app}",`,
      `  "version": "${ver(rng, [0, 2])}",`,
      `  "private": true,`,
      `  "type": "module",`,
      `  "scripts": {`,
      ...scripts.map((s, i) => `    ${s}${i < scripts.length - 1 ? "," : ""}`),
      "  },",
      `  "dependencies": {`,
      ...list(st.deps),
      "  },",
      `  "devDependencies": {`,
      ...list(st.devDeps),
      "  }",
      "}",
    );
  },
};

// ─────────────────────────── YAML ───────────────────────────

const compose: Topic = {
  id: "compose",
  gen(rng) {
    const app = pick(rng, APPS);
    const db = snake({ w: app.split("-") });
    const pg = chance(rng, 0.6);
    return ex(
      `docker-compose.yml de ${app} con su base de datos`,
      "services:",
      "  app:",
      "    build: .",
      "    ports:",
      `      - "${pick(rng, [3000, 8000, 8080])}:${pick(rng, [3000, 8000])}"`,
      "    env_file: .env",
      "    depends_on:",
      "      - db",
      "  db:",
      `    image: ${pg ? `postgres:${int(rng, 15, 17)}` : `mysql:${pick(rng, ["8.0", "8.4"])}`}`,
      "    environment:",
      pg ? `      POSTGRES_DB: ${db}` : `      MYSQL_DATABASE: ${db}`,
      pg ? `      POSTGRES_PASSWORD: ${hex(rng, 10)}` : `      MYSQL_ROOT_PASSWORD: ${hex(rng, 10)}`,
      "    volumes:",
      `      - db-data:/var/lib/${pg ? "postgresql/data" : "mysql"}`,
      "volumes:",
      "  db-data:",
    );
  },
};

const workflow: Topic = {
  id: "workflow",
  gen(rng) {
    const py = chance(rng, 0.4);
    const head = ["name: CI", "on:", "  push:", "    branches: [main]", "  pull_request:", "jobs:", "  test:", "    runs-on: ubuntu-latest", "    steps:", "      - uses: actions/checkout@v7"];
    const body = py
      ? ["      - uses: actions/setup-python@v5", "        with:", `          python-version: "3.${int(rng, 12, 14)}"`, "      - run: pip install -r requirements.txt", "      - run: pytest -q"]
      : ["      - uses: actions/setup-node@v7", "        with:", `          node-version: ${pick(rng, [22, 24])}`, "      - run: npm ci", "      - run: npm test"];
    return ex(`Workflow de GitHub Actions que corre los tests de un proyecto ${py ? "Python" : "Node"}`, ...head, ...body);
  },
};

const configYaml: Topic = {
  id: "config",
  gen(rng) {
    const app = pick(rng, APPS);
    return ex(
      `config.yaml de ${app} con servidor, logs y lista de orígenes`,
      "server:",
      `  host: 0.0.0.0`,
      `  port: ${pick(rng, [8000, 8080, 9000])}`,
      `  workers: ${int(rng, 2, 8)}`,
      "logging:",
      `  level: ${pick(rng, ["info", "debug", "warning"])}`,
      `  file: logs/${app}.log`,
      "cors:",
      "  origins:",
      "    - http://localhost:5173",
      `    - https://${app}.example.com`,
      `feature_flags: { beta: ${chance(rng, 0.5)}, dark_mode: true }`,
    );
  },
};

// ─────────────────────────── Markdown ───────────────────────────

const readme: Topic = {
  id: "readme",
  gen(rng) {
    const app = pick(rng, APPS);
    return pick(rng, [
      () => ex(
        `Inicio del README de ${app}`,
        `# ${app}`,
        "",
        `> A small **${pick(rng, ["open source", "self-hosted", "offline"])}** project built for learning.`,
        "",
        "## Features",
        "",
        "- Fast and *lightweight*",
        "- Works offline",
        `- [Live demo](https://${app}.example.com)`,
      ),
      () => ex(
        `Sección de instalación del README de ${app}`,
        "## Install",
        "",
        "1. Clone the repository",
        "2. Copy `.env.example` to `.env`",
        "3. Run `npm ci` and then `npm run dev`",
      ),
      () => ex(
        `Bloque de código con los comandos para levantar ${app}`,
        "```bash",
        `git clone https://github.com/user/${app}.git`,
        `cd ${app} && npm ci`,
        "```",
      ),
    ])();
  },
};

const mdExtras: Topic = {
  id: "md-extras",
  gen(rng) {
    return pick(rng, [
      () => ex(
        "Tabla de scripts disponibles en Markdown",
        "| Script | Description |",
        "| --- | --- |",
        "| dev | Starts the dev server |",
        "| build | Builds for production |",
        `| test | Runs ${int(rng, 20, 300)} tests |`,
      ),
      () => ex(
        "Lista de tareas pendientes en Markdown",
        "## Roadmap",
        "",
        "- [x] Basic layout",
        `- [${chance(rng, 0.5) ? "x" : " "}] Dark mode`,
        "- [ ] Export to PDF",
      ),
      () => ex(
        "Imagen, enlace y nota al pie en Markdown",
        "![Screenshot](docs/screenshot.png)",
        "",
        "See the [contributing guide](CONTRIBUTING.md) for details.[^1]",
        "",
        "[^1]: Pull requests are welcome.",
      ),
    ])();
  },
};

export const FORMATS: Track = {
  id: "formats",
  label: "ARCHIVO",
  cumulative: false,
  variants: [],
  symbols: [
    "=", ":", "/", "@", ".", "_", "-", "#", '"', "{", "}", "[", "]", ",", "<", ">", "~", "*", "`", "|", "(", ")", "!", "^",
    "&", ...DIGITS,
  ],
  steps: [
    { id: "env", name: ".env", variants: [""], desc: "Variables de entorno: puertos, URLs de conexión, secretos y comentarios", topics: [envFile] },
    { id: "requirements", name: "requirements.txt", variants: [""], desc: "Dependencias de Python con versiones fijas, mínimas y compatibles", topics: [requirements] },
    { id: "json", name: "JSON", variants: [""], desc: "Objetos, arrays, anidamiento, null y respuestas típicas de una API", topics: [jsonObject, jsonArray] },
    { id: "package-json", name: "package.json", variants: [""], desc: "Scripts, dependencias y rangos de versión de un proyecto de Node", topics: [packageJson] },
    { id: "yaml", name: "YAML", variants: [""], desc: "docker-compose, workflows de GitHub Actions y archivos de configuración", topics: [compose, workflow, configYaml] },
    { id: "markdown", name: "Markdown", variants: [""], desc: "README: títulos, listas, enlaces, bloques de código, tablas y tareas", topics: [readme, mdExtras] },
  ],
};
