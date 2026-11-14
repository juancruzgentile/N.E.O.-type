import type { FuentesTema } from "./tipos";

const README = "https://github.com/google-gemini/gemini-cli/blob/main/README.md";
const TRANSICION = "https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/";
const INSTALAR = "https://www.geminicli.com/docs/get-started/installation";
const AUTH = "https://www.geminicli.com/docs/get-started/authentication";
const CLI_REF = "https://www.geminicli.com/docs/cli/cli-reference";
const COMANDOS = "https://www.geminicli.com/docs/reference/commands";
const GEMINI_MD = "https://www.geminicli.com/docs/cli/gemini-md";
const CONFIG = "https://www.geminicli.com/docs/reference/configuration";
const SANDBOX = "https://www.geminicli.com/docs/cli/sandbox";
const CONFIANZA = "https://www.geminicli.com/docs/cli/trusted-folders";
const MCP = "https://www.geminicli.com/docs/tools/mcp-server";
const EXTENSIONES = "https://geminicli.com/docs/extensions/";
const CUSTOM = "https://www.geminicli.com/docs/cli/custom-commands";
const HEADLESS = "https://www.geminicli.com/docs/cli/headless";
const MODELOS = "https://www.geminicli.com/docs/cli/model";
const CUOTAS = "https://www.geminicli.com/docs/resources/quota-and-pricing";
const ATAJOS = "https://www.geminicli.com/docs/reference/keyboard-shortcuts";
const ACTION = "https://github.com/google-github-actions/run-gemini-cli";
const CODE_ASSIST = "https://docs.cloud.google.com/gemini/docs/codeassist/agent-mode";

export const gemini: FuentesTema = {
  version: "Gemini CLI 0.68.0 (estable del 10 de noviembre de 2026)",
  entradas: {
    "Gemini CLI hoy: quién puede usarla": [TRANSICION],
    "Instalar Gemini CLI": [INSTALAR],
    "Primera vez: iniciar sesión": [AUTH],
    "Ejecutar y actualizar": [CLI_REF],
    "Comandos de /": [COMANDOS],
    "@ y !: archivos y shell": [COMANDOS],
    "GEMINI.md": [GEMINI_MD],
    "Elegir modelo": [MODELOS],
    "Ver uso y límites": [CUOTAS],
    "Qué revisar antes de aprobar": [SANDBOX],
    "Modos de aprobación": [ATAJOS],
    "Sandbox": [SANDBOX],
    "Carpetas de confianza": [CONFIANZA],
    "settings.json": [CONFIG],
    "Comandos propios (.toml)": [CUSTOM],
    "MCP: agregar un servidor": [MCP],
    "MCP en settings.json": [MCP],
    "Extensiones": [EXTENSIONES],
    "Retomar y deshacer": [COMANDOS],
    "Modo no interactivo (-p)": [HEADLESS],
    "Salida JSON para scripts": [HEADLESS],
    "GitHub Action": [ACTION],
    "Dónde se usan los modelos Gemini": [CODE_ASSIST],
    "Contenido externo no es instrucción": [CONFIANZA],
    "MCP y extensiones con el mínimo de permisos": [MCP],
    "Gemini CLI vs. Claude Code y Codex: memoria": [GEMINI_MD],
    "Gemini CLI vs. Claude Code y Codex: permisos": [CLI_REF],
    "Gemini CLI vs. Claude Code y Codex: cuentas": [README],
  },
};
