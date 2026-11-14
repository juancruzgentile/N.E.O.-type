import { type Clase, code } from "../types";

const LINEA = "──────────────────────────────────────────────────────────────────────────────";

export const claseGemini: Clase = {
  titulo: "Gemini CLI de cero: qué es, cómo trabaja y para quién quedó",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es `gemini`, cómo es el bucle del agente por dentro, cómo se instala y se configura, " +
    "qué modelos Gemini hay y dónde se usan, y el cambio de junio de 2026 que lo dejó para cuentas de empresa y claves pagas.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Gemini CLI es un **agente de programación para la terminal**, de **código abierto** (licencia Apache 2.0), hecho por Google. Lo abrís con `gemini` dentro de la carpeta de tu proyecto, le pedís algo en lenguaje natural y él lee archivos, propone cambios, corre comandos y te va mostrando lo que hace.",
        "El problema que resuelve es el ida y vuelta entre el chat y el código: en vez de copiar un error en una web y pegar la respuesta a mano, el agente **ve tu proyecto de verdad** (los archivos, la salida de los tests) y trabaja sobre él, con tu permiso en cada paso que cambia algo.",
        "Ojo con una cosa antes de seguir: desde el 18 de junio de 2026, Gemini CLI quedó para organizaciones con **Gemini Code Assist Standard o Enterprise** y para claves pagas de la API de Gemini o de Vertex AI. Si usás Gemini con una cuenta personal (gratuita o Google AI Pro/Ultra), la herramienta de terminal que te corresponde es Antigravity CLI, que tiene su propio tema en la Biblioteca.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Google la presentó el 25 de junio de 2025 como un agente abierto y gratuito, con una cuenta personal de Google y una cuota diaria generosa. Al poco tiempo el **modo agente de Gemini Code Assist** en VS Code pasó a usar Gemini CLI por dentro, así que el mismo motor quedó en la terminal y en el editor.",
      ],
      lista: [
        "Junio de 2025: primera versión pública, en GitHub (`google-gemini/gemini-cli`) y en npm (`@google/gemini-cli`).",
        "Durante 2025 se suman los comandos propios en `.toml`, la GitHub Action `run-gemini-cli` y las extensiones.",
        "19 de mayo de 2026: Google anuncia Antigravity CLI, una terminal nueva escrita en Go que comparte el motor con la app Antigravity 2.0.",
        "18 de junio de 2026: Gemini CLI y las extensiones de Code Assist para el IDE **dejan de atender a cuentas gratuitas y a Google AI Pro/Ultra**. Las licencias de empresa siguen igual.",
        "Noviembre de 2026: sigue saliendo una versión estable por semana (la que comprobamos es la 0.68.0), pero el README avisa que no está ajustada para la serie Gemini 4.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      diagrama: "bucle",
      parrafos: [
        "Gemini CLI no es el modelo: es el **programa que rodea al modelo** (el harness). Arma el contexto con tu mensaje, el historial, lo que dicen los `GEMINI.md` y la lista de herramientas disponibles, y lo manda a un modelo Gemini por la red. El modelo contesta con texto o con un pedido de usar una herramienta.",
        "Las herramientas de fábrica son funciones concretas: `read_file`, `write_file`, `replace` (editar un pedazo de archivo), `list_directory`, `glob`, `grep_search`, `run_shell_command`, `google_web_search` y `web_fetch`. A eso se le suman las de los servidores MCP y las extensiones.",
        "Antes de ejecutar una herramienta que cambia algo, pasa por el **modo de aprobación** (te pregunta o no) y, si lo prendiste, por el **sandbox** (qué puede tocar). El resultado (la salida del comando, el error, el diff) vuelve al contexto y el modelo decide el paso siguiente. Ese bucle se repite hasta que la tarea queda hecha o hace falta que intervengas.",
        "Por eso conviene darle una forma de verificarse: si en `GEMINI.md` dice cómo correr los tests, el agente puede **cerrar el bucle solo**, probando su propio cambio en vez de suponer que salió bien.",
      ],
    },
    {
      heading: "Instalación paso a paso",
      parrafos: [
        "Necesitás **Node.js 20 o más nuevo** y un sistema soportado: macOS 15+, Windows 11 24H2+ o Ubuntu 20.04+. Con 4 GB de memoria alcanza para uso liviano; para sesiones largas sobre proyectos grandes, Google recomienda 16 GB. En Cloud Shell ya viene instalada.",
      ],
      lista: [
        "Fijate la versión de Node con `node -v`. Si es menor a 20, actualizala primero.",
        "Instalá con el gestor que uses. `npm install -g @google/gemini-cli` anda en los tres sistemas (en Windows, desde PowerShell).",
        "Comprobá que quedó con `gemini -v`.",
        "Para probarla sin instalar nada, `npx @google/gemini-cli`.",
      ],
      codigo: [
        code`
node -v                              # tiene que ser v20 o mas
npm install -g @google/gemini-cli    # cualquier sistema
brew install gemini-cli              # macOS o Linux con Homebrew
sudo port install gemini-cli         # macOS con MacPorts
gemini -v                            # ver la version instalada
npm install -g @google/gemini-cli@latest   # actualizar (con npm)
brew upgrade gemini-cli              # actualizar (con Homebrew)

# canales: latest (estable, semanal), preview (semanal), nightly (diario)
npm install -g @google/gemini-cli@preview`,
      ],
    },
    {
      heading: "Tu primera sesión paso a paso",
      parrafos: [
        "La primera vez, `gemini` te pregunta **cómo iniciar sesión**. Hay tres caminos, y el que elijas define tus límites de uso, el precio y las condiciones de privacidad:",
      ],
      lista: [
        "**Sign in with Google**: para la licencia de Code Assist de tu organización. Se abre el navegador y tenés que indicar el proyecto de Google Cloud con `GOOGLE_CLOUD_PROJECT`.",
        "Use Gemini API key: una clave de Google AI Studio (aistudio.google.com/apikey) en la variable `GEMINI_API_KEY`.",
        "Vertex AI: con `GOOGLE_CLOUD_PROJECT` y `GOOGLE_CLOUD_LOCATION`, iniciando sesión con `gcloud auth application-default login`, con una cuenta de servicio (`GOOGLE_APPLICATION_CREDENTIALS`) o con una clave de Google Cloud (`GOOGLE_API_KEY`).",
        "Después aparece el aviso de **carpeta de confianza**: elegí Trust folder solo si el proyecto es tuyo o lo revisaste.",
        "Corré `/init` para que genere un `GEMINI.md` y pedile una primera tarea chica, por ejemplo que te explique la estructura del proyecto.",
      ],
      codigo: [
        code`
cd mi-proyecto
export GEMINI_API_KEY="tu-clave"   # o el metodo que te corresponda
gemini
> /init
> explicame en cinco lineas como esta organizado este proyecto
> /stats model                     # cuanto llevas usado
> /quit

# para no exportarla cada vez: un .gemini/.env (y sumalo a .gitignore)
GEMINI_API_KEY=tu-clave`,
      ],
    },
    {
      heading: "Comandos esenciales",
      parrafos: [
        "Hay tres tipos de cosas que podés escribir en la caja de entrada: un mensaje normal para el modelo, un **comando de /** que maneja la sesión (no lo ve el modelo), y dos atajos: `@archivo` mete un archivo en el mensaje y `!comando` corre algo en la shell.",
        "Desde afuera, `gemini` tiene opciones para elegir modelo (`-m`), modo de aprobación (`--approval-mode`), sandbox (`-s`) y el **modo no interactivo** (`-p`), que responde y termina.",
      ],
      codigo: [
        code`
# dentro de la sesion
/help                # todos los comandos
/model               # elegir modelo
/memory show         # que le llega de los GEMINI.md
/compress            # resumir la conversacion para liberar contexto
/rewind              # volver atras (tambien Esc dos veces)
/mcp list            # servidores MCP y sus herramientas
/tools               # herramientas disponibles
> revisa @src/app.ts
!npm test

# desde la terminal
gemini -m flash
gemini --approval-mode plan
gemini -s
gemini -p "resumi el README" --output-format json
gemini -r latest     # retomar la ultima sesion`,
      ],
    },
    {
      heading: "Configuración",
      parrafos: [
        "Hay dos archivos que importan. `GEMINI.md` es **lo que el agente sabe** de tu proyecto (instrucciones en Markdown). `settings.json` es **cómo se comporta la CLI** (modelo, tema, sandbox, servidores MCP).",
        "Los `settings.json` se apilan: `~/.gemini/settings.json` es el tuyo, `.gemini/settings.json` el del proyecto (gana sobre el tuyo) y una opción en la línea de comandos gana sobre los dos. En empresas puede haber además un archivo de sistema (en Linux, `/etc/gemini-cli/settings.json`) que pisa todo lo anterior.",
        "Con `context.fileName` podés hacer que lea también `AGENTS.md`, el archivo que usa Codex: así un repo con varios agentes comparte las mismas reglas.",
      ],
      codigo: [
        code`
// .gemini/settings.json (del proyecto)
{
  "model": { "name": "auto" },
  "general": { "defaultApprovalMode": "default" },
  "tools": { "sandbox": "docker" },
  "context": { "fileName": ["AGENTS.md", "GEMINI.md"] },
  "mcpServers": {
    "docs": { "httpUrl": "https://ejemplo.com/mcp" }
  }
}`,
        code`
# GEMINI.md
## Proyecto
- Instalar: npm install
- Tests: npm test (correlos antes de terminar)
- Estilo: TypeScript estricto, sin dependencias nuevas
- No toques dist/ ni .env
@./docs/arquitectura.md`,
      ],
    },
    {
      heading: "Modelos que puede usar",
      parrafos: [
        "En la CLI casi siempre alcanza con un **alias**: `auto` (por defecto, elige según qué tan difícil es la tarea), `pro`, `flash` y `flash-lite`. Qué modelo concreto hay detrás de cada alias depende de tu cuenta y de la versión, así que confirmalo con `/model`.",
        "La serie más nueva, **Gemini 4** (Argon, Carbon, Hydrogen), ya está en la API, pero Google aclara que Gemini CLI no está ajustada para esos modelos y recomienda Antigravity para usarlos. La tabla resume lo que figura en la documentación oficial al 14 de noviembre de 2026; precios y límites, en las páginas oficiales.",
      ],
      tabla: {
        cabeza: ["Modelo", "Para qué", "Dónde está"],
        filas: [
          ["Gemini 4 Argon (`gemini-4-argon`)", "El más capaz: código real, tareas largas de varios pasos.", "API de Gemini (despliegue gradual), app de Gemini para AI Pro y Ultra, Antigravity. No ajustado para Gemini CLI."],
          ["Gemini 3.1 Pro (`gemini-3.1-pro-preview`)", "Razonamiento y código. En la CLI, el alias `pro` apunta acá si tu cuenta tiene acceso a modelos preview; si no, a Gemini 2.5 Pro.", "Gemini CLI, API de Gemini, AI Studio."],
          ["Gemini 3.8 Flash y 3.5 Flash (`gemini-3.8-flash`, `gemini-3.5-flash`)", "Rápidos y baratos para la mayoría de las tareas. El alias `flash` apunta a 3.8 Flash o a una versión preview, según la cuenta.", "Gemini CLI, API de Gemini, AI Studio."],
          ["Gemini 3.5 y 3.1 Flash-Lite", "Lo más liviano: tareas simples y en volumen; alias `flash-lite`.", "Gemini CLI, API de Gemini, AI Studio."],
          ["Gemini 2.5 Pro y 2.5 Flash", "Generación anterior, deprecada: desde el 1 de diciembre de 2026 la API los redirige a modelos nuevos.", "Todavía aceptados por la CLI y la API para usuarios existentes."],
        ],
      },
    },
    {
      heading: "Dónde se usa Gemini además de la terminal",
      parrafos: [
        "La CLI es una de varias puertas a los mismos modelos, y cada una sirve para otra cosa:",
      ],
      lista: [
        "**App de Gemini** (gemini.google.com y celular): el chat. Tiene un selector de modelos en la caja de texto; qué modelos ves depende de tu plan (por ejemplo, Gemini 4 Argon llegó en octubre de 2026 a AI Pro y Ultra).",
        "**Google AI Studio** (aistudio.google.com): para probar modelos en el navegador, comparar respuestas y crear la clave de API que usa `GEMINI_API_KEY`.",
        "API de Gemini y Vertex AI: para usar los modelos desde tu propio código; Vertex AI es lo mismo dentro de Google Cloud, con controles de empresa.",
        "**Gemini Code Assist**: la extensión para VS Code e IntelliJ. Su modo agente en VS Code usa Gemini CLI por dentro, con las mismas herramientas y los mismos servidores MCP.",
      ],
    },
    {
      heading: "Cómo se ve",
      parrafos: [
        "Al abrir `gemini` aparece arriba el logo (un ícono con degradado azul, violeta y rosa, y la palabra GEMINI en letras de bloque), la versión y unos consejos para arrancar. Abajo está la **caja de entrada** entre dos líneas, y debajo una barra con la carpeta, el estado del sandbox, el modelo y cuánto contexto llevás usado.",
        "Fijate en el **\"no sandbox\" en rojo** de la barra de abajo: te avisa que los comandos van a correr sin aislamiento.",
      ],
      captura: {
        tipo: "terminal",
        titulo: "gemini — ~/mi-proyecto",
        lineas: [
          [{ t: " ▝▜▄     ", c: "acento" }, { t: " ▗█▀▀▜▙▝█▛▀▀▌▜██▖▟██▘▜█▘▜██▖▝█▛▝█▛", c: "fuerte" }],
          [{ t: "   ▝▜▄   ", c: "acento" }, { t: " █▌     █▙▟  ▐█▝█▛▐█ ▐█ ▐█▝█▖█▌ █▌", c: "fuerte" }],
          [{ t: "  ▗▟▀    ", c: "acento" }, { t: " ▜▙ ▝█▛ █▌▝ ▖▐█   ▐█ ▐█ ▐█ ▝██▌ █▌", c: "fuerte" }],
          [{ t: " ▝▀      ", c: "acento" }, { t: "  ▀▀▀▀▘▝▀▀▀▀▘▀▀▘  ▀▀▘▀▀▘▀▀▘ ▝▀▀▝▀▀", c: "fuerte" }],
          [],
          [{ t: " Gemini CLI", c: "fuerte" }, { t: " v0.68.0", c: "tenue" }],
          [],
          [{ t: "Tips for getting started:" }],
          [{ t: "1. Create " }, { t: "GEMINI.md", c: "fuerte" }, { t: " files to customize your interactions" }],
          [{ t: "2. " }, { t: "/help", c: "tenue" }, { t: " for more information" }],
          [{ t: "3. Ask coding questions, edit code or run commands" }],
          [{ t: "4. Be specific for the best results" }],
          [],
          [{ t: "                                                               ? for shortcuts", c: "tenue" }],
          [{ t: LINEA, c: "tenue" }],
          [{ t: " > ", c: "acento" }, { t: "  Type your message or @path/to/file", c: "tenue" }],
          [{ t: LINEA, c: "tenue" }],
          [{ t: " workspace (/directory)      sandbox          /model             context", c: "tenue" }],
          [{ t: " ~/mi-proyecto               " }, { t: "no sandbox", c: "error" }, { t: "       auto              0% used" }],
        ],
        pie: "La pantalla de inicio de Gemini CLI: logo, consejos, la caja de entrada y la barra de estado. Recreación de la pantalla de Gemini CLI 0.68.0 (tema por defecto), no es una captura.",
      },
    },
    {
      heading: "Cómo se ve en VS Code (Gemini Code Assist)",
      parrafos: [
        "En VS Code, Gemini Code Assist suma un **ícono de chispa** en la barra de actividades. Al tocarlo se abre el panel de chat; el interruptor **Agent** lo pasa a modo agente (resaltado cuando está activo, gris en el chat común). En modo agente te pide permiso antes de usar una herramienta, y tiene botones para frenar (Stop) y empezar otra conversación (New chat).",
      ],
      captura: {
        tipo: "app",
        titulo: "Visual Studio Code — mi-proyecto",
        paneles: [
          {
            nombre: "Actividad",
            ancho: 0.5,
            lineas: [[{ t: "Archivos", c: "tenue" }], [{ t: "Buscar", c: "tenue" }], [{ t: "Git", c: "tenue" }], [{ t: "✦ Gemini", c: "sel" }]],
          },
          {
            nombre: "Editor",
            ancho: 2,
            lineas: [
              [{ t: "src/app.ts", c: "fuerte" }],
              [],
              [{ t: "export function sumar(a, b) {", c: "tenue" }],
              [{ t: "  return a + b;", c: "tenue" }],
              [{ t: "}", c: "tenue" }],
            ],
          },
          {
            nombre: "Gemini Code Assist",
            ancho: 1.5,
            lineas: [
              [{ t: "Agent", c: "acento" }, { t: "   New chat", c: "tenue" }],
              [],
              [{ t: "Vos: ", c: "fuerte" }, { t: "agrega tests para sumar" }],
              [],
              [{ t: "Gemini quiere usar write_file", c: "fuerte" }],
              [{ t: "src/app.test.ts" }],
              [{ t: "[Allow]", c: "ok" }, { t: "  [Deny]", c: "error" }],
              [],
              [{ t: "Stop", c: "tenue" }],
            ],
          },
        ],
        pie: "Panel de Gemini Code Assist en VS Code con el modo Agent activo y un pedido de permiso. Recreación según la documentación de Code Assist de noviembre de 2026 (los textos de los botones de permiso son aproximados), no es una captura.",
      },
    },
    {
      heading: "Seguridad y buenas prácticas",
      parrafos: [
        "Hay dos controles separados y conviene no confundirlos. El **modo de aprobación** decide cuándo te pregunta: `default` pregunta antes de cada cambio, `auto_edit` aprueba solas las ediciones, `plan` solo lee, y `yolo` aprueba todo. El **sandbox** decide qué puede tocar un comando, y viene apagado.",
        "La regla práctica: para explorar algo que no conocés, `plan` y `-s`; para trabajar en tu proyecto, `default`; `yolo` solo dentro de un contenedor descartable.",
      ],
      lista: [
        "Hacé un commit antes de pedir cambios grandes; además, `/restore` y `/rewind` te devuelven los archivos.",
        "Las claves van en variables de entorno o en `.gemini/.env`, y ese archivo va en `.gitignore`.",
        "No confíes en una carpeta clonada sin mirar qué trae: `.gemini/settings.json`, comandos, hooks y servidores MCP.",
        "Lo que lee de una web, un issue o un servidor MCP es **dato, no instrucción** (prompt injection).",
        "En servidores MCP, `trust: true` saltea todas las confirmaciones: solo para servidores tuyos. Usá tokens de solo lectura y `includeTools` para exponer lo mínimo.",
      ],
    },
    {
      heading: "Errores comunes",
      parrafos: ["Los que más se repiten, y cómo evitarlos:"],
      lista: [
        "Querer usarla con una cuenta personal gratuita o con Google AI Pro/Ultra: desde el 18 de junio de 2026 eso **ya no funciona**; la herramienta para esas cuentas es Antigravity CLI.",
        "Node viejo: con una versión menor a 20 la instalación falla o la CLI no arranca. Mirá `node -v`.",
        "Con Vertex AI, tener `GEMINI_API_KEY` o `GOOGLE_API_KEY` exportadas cuando querés usar `gcloud auth application-default login`: la documentación pide sacarlas primero.",
        "Escribir la clave dentro de `GEMINI.md` o de un `settings.json` que se sube al repo.",
        "Un `GEMINI.md` enorme: se manda con **cada** prompt y se come el contexto. Mejor corto, con imports a archivos aparte.",
        "Nombres de servidores MCP con guion bajo (`mi_servidor`): las reglas de permisos pueden fallar sin avisar. Usá `mi-servidor`.",
        "Pensar que `--approval-mode yolo` es lo mismo que tener sandbox: sin `-s`, aprueba todo y además corre sin aislamiento.",
      ],
    },
    {
      heading: "Comparación con Claude Code y Codex",
      parrafos: [
        "Los tres hacen lo mismo en el fondo: un **bucle de leer, actuar y verificar** con permisos en el medio. Cambian el ecosistema, el nombre de los archivos y cómo se reparten los controles.",
      ],
      tabla: {
        cabeza: ["", "Gemini CLI", "Claude Code", "Codex"],
        filas: [
          ["Quién lo hace", "Google, código abierto (Apache 2.0)", "Anthropic", "OpenAI, CLI de código abierto"],
          ["Cuenta", "Code Assist Standard/Enterprise o clave paga (API, Vertex AI)", "Plan pago de Claude o clave de API", "Planes de ChatGPT o clave de API"],
          ["Archivo de instrucciones", "`GEMINI.md` (puede leer `AGENTS.md`)", "`CLAUDE.md`", "`AGENTS.md`"],
          ["Configuración", "`~/.gemini/settings.json`", "`settings.json` en `~/.claude`", "`~/.codex/config.toml`"],
          ["Permisos", "Modos `default`, `auto_edit`, `plan`, `yolo`", "Modos de permisos (`default`, `acceptEdits`, `plan`, etc.)", "Aprobación (`on-request`, `never`)"],
          ["Sandbox", "Aparte, apagado por defecto (`-s`)", "Aparte, apagado por defecto (`/sandbox`)", "Aparte (`read-only`, `workspace-write`, `danger-full-access`)"],
          ["Sin interacción", "`gemini -p`", "`claude -p`", "`codex exec`"],
          ["Extender", "MCP, extensiones, comandos `.toml`, skills", "MCP, skills, subagentes, plugins", "MCP, skills, SDK"],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Si tu organización tiene Code Assist o usás una clave paga, practicá lo básico en un proyecto chico: `/init`, una tarea con los tests como verificación, y probá `plan` antes de dejarlo editar. Después sumá un servidor MCP y un comando propio en `.toml`.",
        "Como todo esto cambia cada semana (sale una versión estable por semana), la fuente confiable es la **documentación oficial** en geminicli.com/docs y el README del repositorio. Si tenés una cuenta personal de Google, seguí con el tema de Antigravity en la Biblioteca.",
      ],
    },
  ],
  fuentes: [
    { texto: "README de Gemini CLI (estado, instalación, autenticación)", url: "https://github.com/google-gemini/gemini-cli/blob/main/README.md" },
    { texto: "Transición de Gemini CLI a Antigravity CLI (Google Developers Blog)", url: "https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/" },
    { texto: "Anuncio de Gemini CLI (junio de 2025)", url: "https://blog.google/technology/developers/introducing-gemini-cli-open-source-ai-agent/" },
    { texto: "Instalación", url: "https://www.geminicli.com/docs/get-started/installation" },
    { texto: "Autenticación", url: "https://www.geminicli.com/docs/get-started/authentication" },
    { texto: "Referencia de la CLI (opciones y subcomandos)", url: "https://www.geminicli.com/docs/cli/cli-reference" },
    { texto: "Comandos de /", url: "https://www.geminicli.com/docs/reference/commands" },
    { texto: "GEMINI.md", url: "https://www.geminicli.com/docs/cli/gemini-md" },
    { texto: "Configuración (settings.json)", url: "https://www.geminicli.com/docs/reference/configuration" },
    { texto: "Sandbox", url: "https://www.geminicli.com/docs/cli/sandbox" },
    { texto: "Servidores MCP", url: "https://www.geminicli.com/docs/tools/mcp-server" },
    { texto: "Modo headless", url: "https://www.geminicli.com/docs/cli/headless" },
    { texto: "Modelos en Gemini CLI", url: "https://www.geminicli.com/docs/cli/model" },
    { texto: "Cuotas y precios", url: "https://www.geminicli.com/docs/resources/quota-and-pricing" },
    { texto: "Modelos de la API de Gemini", url: "https://aistudio.google.com/docs/models" },
    { texto: "Gemini 4 Argon", url: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/" },
    { texto: "Novedades de la app de Gemini", url: "https://gemini.google/release-notes/" },
    { texto: "Modo agente de Gemini Code Assist", url: "https://docs.cloud.google.com/gemini/docs/codeassist/use-agentic-chat-pair-programmer" },
    { texto: "GitHub Action run-gemini-cli", url: "https://github.com/google-github-actions/run-gemini-cli" },
  ],
  revisada: "2026-11-14",
};
