import type { FuentesTema } from "./tipos";

const DOCS = "https://hermes-agent.nousresearch.com/docs";
const INSTALL = `${DOCS}/getting-started/installation`;
const QUICK = `${DOCS}/getting-started/quickstart`;
const CLI = `${DOCS}/user-guide/cli`;
const TUI = `${DOCS}/user-guide/tui`;
const CONFIG = `${DOCS}/user-guide/configuration`;
const SECURITY = `${DOCS}/user-guide/security`;
const CHECKPOINTS = `${DOCS}/user-guide/checkpoints-and-rollback`;
const SESSIONS = `${DOCS}/user-guide/sessions`;
const DESKTOP = `${DOCS}/user-guide/desktop`;
const LOCAL = `${DOCS}/user-guide/local-models`;
const IMPORT = `${DOCS}/user-guide/import-from-other-agents`;
const MEMORY = `${DOCS}/user-guide/features/memory`;
const SKILLS = `${DOCS}/user-guide/features/skills`;
const CONTEXT = `${DOCS}/user-guide/features/context-files`;
const MCP = `${DOCS}/user-guide/features/mcp`;
const CRON = `${DOCS}/user-guide/features/cron`;
const MESSAGING = `${DOCS}/user-guide/messaging/`;
const CLI_REF = `${DOCS}/reference/cli-commands`;
const SLASH = `${DOCS}/reference/slash-commands`;
const PORTAL = `${DOCS}/integrations/nous-portal`;
const MODELS = `${DOCS}/user-guide/configuring-models`;
const REPO = "https://github.com/NousResearch/hermes-agent";

export const hermes: FuentesTema = {
  version: "Hermes Agent v0.23.1 (estable del 10 de noviembre de 2026)",
  entradas: {
    "Instalar Hermes": [INSTALL],
    "Primer inicio: hermes setup": [QUICK],
    "Conectar un proveedor de modelos": [CLI_REF],
    "Ejecutar: CLI clásica o TUI": [TUI],
    "Diagnóstico y actualización": [CLI_REF],
    "Comandos de /": [SLASH],
    "Modo shell con !": [CLI],
    "AGENTS.md y archivos de contexto": [CONTEXT],
    "Memoria entre sesiones": [MEMORY],
    "Elegir modelo": [MODELS],
    "Qué revisar antes de aprobar": [SECURITY],
    "Skills: usar e instalar": [SKILLS],
    "Cómo crea skills el agente": [SKILLS],
    "config.yaml y .env": [CONFIG],
    "Modos de aprobación y YOLO": [SECURITY],
    "Backends de terminal (sandbox)": [CONFIG],
    "MCP: agregar un servidor": [CLI_REF],
    "MCP en config.yaml": [MCP],
    "Retomar, nombrar y bifurcar": [SESSIONS],
    "Gateway de mensajería": [MESSAGING],
    "Tareas programadas (cron)": [CRON],
    "Desktop, dashboard y webapp": [DESKTOP],
    "Modelos locales": [LOCAL],
    "Uso no interactivo y en CI": [CLI_REF],
    "Escrituras protegidas y checkpoints": [CHECKPOINTS],
    "Contenido externo no es instrucción": [SECURITY],
    "Gateway en producción": [SECURITY],
    "Importar desde Claude Code o Codex": [IMPORT],
    "Hermes vs. Claude Code y Codex: memoria": [CONTEXT],
    "Hermes vs. Claude Code y Codex: permisos y modelos": [PORTAL],
    "Cuál conviene para qué": [REPO],
  },
};
