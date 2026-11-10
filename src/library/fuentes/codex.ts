import type { FuentesTema } from "./tipos";

const CLI_REF = "https://learn.chatgpt.com/docs/developer-commands?surface=cli";
const CLI_OV = "https://learn.chatgpt.com/docs/codex/cli";
const GH_README = "https://github.com/openai/codex/blob/main/README.md";
const SDK = "https://learn.chatgpt.com/docs/codex-sdk";
const SANDBOX = "https://learn.chatgpt.com/codex/sandboxing";
const MCP = "https://learn.chatgpt.com/codex/extend/mcp";
const AGENTS = "https://learn.chatgpt.com/codex/agent-configuration/agents-md";
const MODELS = "https://learn.chatgpt.com/codex/models";
const PLATFORMS = "https://chatgpt.com/codex";
const PRICING = "https://chatgpt.com/codex/pricing/";

export const codex: FuentesTema = {
  version: "Codex CLI (línea de modelos GPT-6, noviembre 2026)",
  entradas: {
    "Instalar Codex": [GH_README],
    "Primera vez: iniciar sesión": [CLI_REF],
    "Ejecutar y actualizar": [CLI_REF],
    "Diagnóstico: codex doctor": [CLI_REF],
    "Comandos de /": [CLI_OV],
    "Retomar y bifurcar sesiones": [CLI_REF],
    "AGENTS.md": [AGENTS],
    "Dónde vive Codex": [PLATFORMS],
    "Elegir modelo": [MODELS],
    "Planes de ChatGPT y Codex": [PRICING],
    "Ver cuánto uso te queda": [PRICING],
    "Qué revisar antes de aprobar": [SANDBOX],
    "Modos de aprobación": [SANDBOX],
    "Modos de sandbox": [SANDBOX],
    "Cómo aísla cada sistema": [SANDBOX],
    "config.toml": [CLI_REF],
    "Feature flags": [CLI_REF],
    "MCP: agregar un servidor": [MCP],
    "MCP en config.toml": [MCP],
    "Traer una tarea de la nube al local": [CLI_REF],
    "Codex en GitHub": [PLATFORMS],
    "Codex SDK": [SDK],
    "Codex app-server": [SDK],
    "Aislar lo que no conocés": [SANDBOX],
    "Contenido externo no es instrucción": [AGENTS],
    "MCP con el mínimo de permisos": [MCP],
    "Codex vs. Claude Code: cuentas y planes": [PRICING],
    "Codex vs. Claude Code: memoria y configuración": [AGENTS],
    "Codex vs. Claude Code: permisos y sandbox": [SANDBOX],
    "Codex vs. Claude Code: cómo se extienden": [SDK],
  },
};
