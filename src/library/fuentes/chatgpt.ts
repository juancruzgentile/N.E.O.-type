import type { FuentesTema } from "./tipos";

const APP = "https://learn.chatgpt.com/codex/app";
const WINDOWS = "https://learn.chatgpt.com/codex/app/windows";
const LINUX = "https://learn.chatgpt.com/docs/linux/linux-app";
const DESCARGA = "https://chatgpt.com/download/";
const MOVIL = "https://learn.chatgpt.com/codex/mobile";
const QUICKSTART = "https://learn.chatgpt.com/codex/quickstart?setup=app";
const WORK = "https://learn.chatgpt.com/codex/get-started-with-work";
const ATAJOS = "https://learn.chatgpt.com/codex/app/commands";
const PRECIOS = "https://chatgpt.com/pricing/";
const MODELOS_CHAT = "https://help.openai.com/en/articles/20001354-gpt-6-and-other-models-in-chatgpt";
const ELEGIR = "https://learn.chatgpt.com/codex/model-selection";
const PROMPTS = "https://developers.openai.com/api/docs/guides/prompt-engineering";
const ESTUDIO = "https://openai.com/index/chatgpt-study-mode/";
const PROYECTOS = "https://learn.chatgpt.com/codex/projects";
const MEMORIA = "https://learn.chatgpt.com/codex/customization/memories";
const PERSONALIZAR = "https://learn.chatgpt.com/codex/personalize";
const TEMPORAL = "https://help.openai.com/en/articles/7730893-chatgpt-temporary-chat-faq";
const DATOS = "https://help.openai.com/articles/7730893-data-controls-in-chatgpt";
const BUSQUEDA = "https://learn.chatgpt.com/codex/web-search";
const ANALISIS = "https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt";
const CANVAS = "https://academy.openai.com/public/clubs/work-users-ynjqu/resources/canvas";
const PLUGINS = "https://learn.chatgpt.com/codex/plugins";
const GPTS = "https://learn.chatgpt.com/codex/migrate-custom-gpts";
const API = "https://developers.openai.com/api/docs/quickstart";
const API_DATOS = "https://developers.openai.com/api/docs/guides/your-data";

export const chatgpt: FuentesTema = {
  version: "ChatGPT (web y app de escritorio con Chat, Work y Codex; línea GPT-6, noviembre 2026)",
  entradas: {
    "Dónde se usa ChatGPT": [DESCARGA],
    "Instalar en macOS y Windows": [WINDOWS],
    "Instalar en Linux": [LINUX],
    "Apps para el celular": [MOVIL],
    "Primer inicio y login": [APP],
    "Chat, Work y Codex": [WORK],
    "Atajos de teclado": [ATAJOS],
    "Planes de ChatGPT": [PRECIOS],
    "Elegir modelo y razonamiento": [MODELOS_CHAT],
    "Pedirle código": [PROMPTS],
    "Depurar un error": [ELEGIR],
    "Aprender sin que te haga la tarea": [ESTUDIO],
    "Proyectos": [PROYECTOS],
    "Memoria": [MEMORIA],
    "Instrucciones personalizadas": [PERSONALIZAR],
    "Chat temporal": [TEMPORAL],
    "Controles de datos y entrenamiento": [DATOS],
    "Búsqueda web": [BUSQUEDA],
    "Análisis de datos (Python)": [ANALISIS],
    "Canvas": [CANVAS],
    "Plugins (apps y conectores)": [PLUGINS],
    "GPTs personalizados": [GPTS],
    "API: clave y SDK": [API],
    "API: primer pedido": [API],
    "API: lo mismo en Python": [API],
    "API: tus datos": [API_DATOS],
    "Revisar lo que te devuelve": [ELEGIR],
    "Prompt injection": [PLUGINS],
    "ChatGPT vs. Claude y Codex": [QUICKSTART],
  },
};
