import type { FuentesTema } from "./tipos";

const INTRO = "https://opencode.ai/docs";
const CLI = "https://opencode.ai/docs/cli";
const CLI_CMDS = "https://opencode.ai/docs/cli/commands";
const CLI_PROV = "https://opencode.ai/docs/cli/providers";
const TUI = "https://opencode.ai/docs/cli/tui";
const KEYS = "https://opencode.ai/docs/cli/keybinds";
const ACP = "https://opencode.ai/docs/cli/acp";
const AGENTS = "https://opencode.ai/docs/agents";
const INSTR = "https://opencode.ai/docs/instructions";
const CONFIG = "https://opencode.ai/docs/config";
const PERMS = "https://opencode.ai/docs/permissions";
const POLICIES = "https://opencode.ai/docs/policies";
const MODELS = "https://opencode.ai/docs/models";
const PROVIDERS = "https://opencode.ai/docs/providers";
const MCP = "https://opencode.ai/docs/mcp-servers";
const COMMANDS = "https://opencode.ai/docs/commands";
const SNAPSHOTS = "https://opencode.ai/docs/snapshots";
const CLIENT = "https://opencode.ai/docs/build/client";

export const opencode: FuentesTema = {
  version: "OpenCode 2.3.0 (13 de noviembre de 2026, documentación V2)",
  entradas: {
    "Instalar OpenCode": [INTRO, "2.0.0"],
    "Conectar un proveedor": [CLI_PROV],
    "Abrir la TUI y pedir algo": [TUI],
    "Comandos de /": [TUI],
    "Atajos de teclado": [KEYS],
    "Agentes build y plan": [AGENTS],
    "AGENTS.md": [INSTR],
    "Elegir modelo": [MODELS],
    "Qué revisar antes de aprobar": [PERMS],
    "Dónde corre OpenCode": [CLI],
    "opencode.json": [CONFIG],
    "Reglas de permisos": [PERMS],
    "Aprobar una vez o siempre": [PERMS],
    "Modelos locales (Ollama, LM Studio)": [PROVIDERS],
    "MCP: agregar un servidor": [MCP],
    "MCP en opencode.json": [MCP],
    "Crear un subagente": [AGENTS],
    "Comandos propios": [COMMANDS],
    "Deshacer con /undo": [SNAPSHOTS],
    "opencode run": [CLI_CMDS],
    "OpenCode en CI": [CLI_CMDS],
    "Servidor de fondo y SDK": [CLIENT, "2.0.0"],
    "Usarlo desde el editor (ACP)": [ACP],
    "Sin sandbox: limitá el shell": [PERMS],
    "Contenido externo no es instrucción": [COMMANDS],
    "Policies: reglas que no se aflojan": [POLICIES],
    "OpenCode vs. Claude Code y Codex: modelos": [PROVIDERS],
    "OpenCode vs. Claude Code y Codex: memoria": [INSTR],
    "OpenCode vs. Claude Code y Codex: permisos": [PERMS],
    "Cuál conviene para qué": [INTRO],
  },
};
