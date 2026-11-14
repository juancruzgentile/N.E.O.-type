import type { FuentesTema } from "./tipos";

const START = "https://antigravity.google/docs/getting-started";
const AUTH = "https://antigravity.google/docs/install/";
const CLI_REF = "https://antigravity.google/docs/cli/reference/";
const CLI_USE = "https://antigravity.google/docs/cli/using/";
const HEADLESS = "https://antigravity.google/docs/cli/headless/";
const PROJECTS = "https://antigravity.google/docs/projects/";
const PLANS = "https://antigravity.google/docs/plans/";
const RULES = "https://antigravity.google/docs/rules/";
const SKILLS = "https://antigravity.google/docs/migration/workflows-to-skills/";
const MODELS = "https://antigravity.google/docs/models/";
const ARTIFACTS = "https://antigravity.google/docs/artifacts/";
const PERMS = "https://antigravity.google/docs/permissions/";
const MCP = "https://antigravity.google/docs/mcp/";
const GCLI = "https://antigravity.google/docs/cli/gcli-migration/";
const OVERVIEW = "https://antigravity.google/docs/overview/";

export const antigravity: FuentesTema = {
  version: "Antigravity App 2.32.0 y CLI agy 1.5.8 (noviembre 2026)",
  entradas: {
    "Instalar la app": [START],
    "Instalar la CLI (agy)": [START],
    "Primer inicio y cuenta": [AUTH],
    "Ejecutar agy": [CLI_REF],
    "Comandos de /": [CLI_REF],
    "Atajos de la CLI": [CLI_USE],
    "Proyectos y worktrees": [PROJECTS],
    "Planes y cuota": [PLANS],
    "AGENTS.md y GEMINI.md": [RULES],
    "Reglas en .agents/rules": [RULES],
    "Skills (antes workflows)": [SKILLS, "App 2.12.0 (migración automática)"],
    "settings.json de la CLI": [CLI_REF],
    "Elegir modelo": [MODELS],
    "Artefactos": [ARTIFACTS],
    "Modos de la CLI": [PERMS, "auto: CLI 1.3.5 (macOS/Linux), 1.4.4 (Windows)"],
    "Presets de permisos de la app": [PERMS, "Auto: App 2.23.0 (macOS/Linux), 2.26.0 (Windows)"],
    "MCP: mcp_config.json": [MCP],
    "Reglas allow, ask y deny": [PERMS],
    "El navegador del agente": [PERMS, "descargas con aprobación: App 2.31.0"],
    "agy -p en scripts y CI": [HEADLESS],
    "Salida JSON y esquema": [HEADLESS],
    "Venir de Gemini CLI": [GCLI],
    "Antigravity vs. Claude Code y Codex: instrucciones": [RULES],
    "Antigravity vs. Claude Code y Codex: permisos": [PERMS],
    "Cuál conviene para qué": [OVERVIEW],
  },
};
