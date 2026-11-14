import type { FuentesTema } from "./tipos";

const QUICK = "https://cursor.com/docs/get-started/quickstart";
const VSCODE = "https://cursor.com/help/getting-started/migrate-vscode";
const TAB = "https://cursor.com/help/ai-features/tab";
const INLINE = "https://cursor.com/help/ai-features/inline-edit";
const ATAJOS = "https://cursor.com/help/customization/keyboard-shortcuts";
const CONTEXT = "https://cursor.com/help/customization/context";
const RULES = "https://cursor.com/docs/rules";
const CLI_INSTALL = "https://cursor.com/docs/cli/installation";
const CLI_USING = "https://cursor.com/docs/cli/using";
const CLI_PARAMS = "https://cursor.com/docs/cli/reference/parameters";
const CLI_SLASH = "https://cursor.com/docs/cli/reference/slash-commands";
const CLI_CONFIG = "https://cursor.com/docs/cli/reference/configuration";
const CLI_PERMS = "https://cursor.com/docs/cli/reference/permissions";
const HEADLESS = "https://cursor.com/docs/cli/headless";
const MODELS = "https://cursor.com/docs/models-and-pricing";
const PRIVACY = "https://cursor.com/help/security-and-privacy/privacy";
const PLAN = "https://cursor.com/docs/agent/plan-mode";
const AGENT = "https://cursor.com/docs/agent/overview";
const WINDOW = "https://cursor.com/docs/agent/agents-window";
const CLOUD = "https://cursor.com/docs/cloud-agent";
const MCP = "https://cursor.com/docs/mcp";
const RUN_MODES = "https://cursor.com/docs/agent/security/run-modes";
const SECURITY = "https://cursor.com/docs/agent/security";
const IGNORE = "https://cursor.com/help/customization/ignore-files";
const BUGBOT = "https://cursor.com/docs/bugbot";
const REVIEW = "https://cursor.com/docs/agent/agent-review";

export const cursor: FuentesTema = {
  version: "Cursor 3.30 y CLI agent 2026.10.22 (noviembre 2026)",
  entradas: {
    "Instalar Cursor": [QUICK],
    "Primer inicio e importar VS Code": [VSCODE],
    "Tab: autocompletado": [TAB],
    "Cmd/Ctrl+K: código al agente": [INLINE],
    "Abrir el Agent y elegir modo": [ATAJOS],
    "@-menciones": [CONTEXT],
    "Reglas: .cursor/rules y AGENTS.md": [RULES],
    "Instalar la CLI (agent)": [CLI_INSTALL],
    "Elegir modelo": [MODELS],
    "Planes": [MODELS],
    "Privacy Mode": [PRIVACY],
    "Usar la CLI": [CLI_USING],
    "Comandos de /": [CLI_SLASH],
    "Plan Mode": [PLAN],
    "Checkpoints": [AGENT],
    "Agents Window": [WINDOW, "3.0"],
    "Cloud Agents": [CLOUD],
    "MCP: mcp.json": [MCP],
    "MCP desde la CLI": [CLI_PARAMS],
    "Run Modes": [RUN_MODES],
    "Sandbox de la terminal": [RUN_MODES],
    ".cursorignore": [IGNORE],
    "Bugbot": [BUGBOT],
    "Modo no interactivo (CI)": [HEADLESS],
    "Configuración y permisos de la CLI": [CLI_CONFIG],
    "Shell(git) deja pasar git push": [CLI_PERMS],
    "Repos que no conocés": [SECURITY],
    "Agent Review": [REVIEW],
    "Auto, Cursor Router y Max Mode": [MODELS],
    "Memoria: ya no hay Memories": [RULES],
    "Cursor vs. Claude Code y Codex: dónde viven": [WINDOW],
    "Cursor vs. Claude Code y Codex: instrucciones y modelos": [CLI_USING],
    "Cursor vs. Claude Code y Codex: permisos": [RUN_MODES],
  },
};
