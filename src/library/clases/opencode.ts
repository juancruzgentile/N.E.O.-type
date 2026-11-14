import { type Clase, code } from "../types";

export const claseOpencode: Clase = {
  titulo: "OpenCode de cero: un agente abierto para cualquier modelo",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es OpenCode, de dónde salió, cómo trabaja por dentro, " +
    "cómo instalarlo y usarlo la primera vez, cómo configurarlo y cómo se compara con **Claude Code** y **Codex**.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "OpenCode es un **agente de programación**: un programa que le pasa tu pedido a un modelo de lenguaje y le da herramientas para leer archivos, editarlos y correr comandos en tu proyecto. Lo usás desde la terminal con `opencode`, desde una app de escritorio, desde el navegador o desde el celular.",
        "Lo que lo distingue es que es **de código abierto** (licencia MIT) y **no está atado a un fabricante de modelos**. Claude Code usa modelos de Anthropic y Codex los de OpenAI; OpenCode se conecta a cientos de proveedores (Anthropic, OpenAI, Google, GitHub Copilot, OpenRouter, Amazon Bedrock y más) y también a **modelos que corren en tu propia máquina** con Ollama o LM Studio.",
        "El problema que resuelve es elegir: podés usar la cuenta que ya pagás (por ejemplo, ChatGPT Plus o GitHub Copilot), probar un modelo nuevo sin cambiar de herramienta, o trabajar con un modelo local cuando no querés mandar el código afuera.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "OpenCode lo hace **Anomaly**, la empresa detrás de SST (un framework para crear aplicaciones sobre tu propia infraestructura) y de OpenTUI, la biblioteca con la que está hecha su interfaz de terminal. El repositorio oficial es `github.com/anomalyco/opencode` (el viejo `sst/opencode` redirige ahí) y el sitio es opencode.ai.",
      ],
      lista: [
        "Abril de 2025: primera versión pública, la 0.0.1.",
        "Octubre de 2025: OpenCode 1.0.",
        "Diciembre de 2025: sale la app de escritorio.",
        "Septiembre de 2026: **OpenCode 2.0**, con un servidor en segundo plano, una configuración nueva y cambios en los plugins y en la API. Esta clase describe la versión 2.",
        "Noviembre de 2026: la versión 2.3.0 y más de 220.000 estrellas en GitHub.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      diagrama: "bucle",
      parrafos: [
        "Como todo agente, OpenCode repite un **bucle**: arma el contexto (tu pedido, el historial, el contenido de `AGENTS.md`), se lo manda al modelo, el modelo responde con texto o con un pedido de herramienta (leer un archivo, editarlo, correr `npm test`), OpenCode revisa los **permisos** de esa acción, la ejecuta y le devuelve el resultado al modelo. Así hasta que el modelo da la tarea por terminada.",
        "La pieza propia de la versión 2 es el **servidor en segundo plano**. Cuando abrís `opencode`, la TUI busca (o arranca) un servidor único para tu usuario, y ese servidor es el que guarda las sesiones, la configuración, las credenciales y los permisos, y el que corre las herramientas. La TUI, la app de escritorio, la web y el celular son solo **clientes** de ese servidor: por eso podés empezar una sesión en la compu y seguirla desde el teléfono.",
        "El modelo no es parte de OpenCode: lo elige cada sesión entre los proveedores que conectaste. El catálogo de modelos sale de models.dev, una base de datos abierta de modelos que también mantiene Anomaly.",
      ],
    },
    {
      heading: "Instalación paso a paso",
      parrafos: [
        "Hay varias formas; elegí una sola. En **macOS y Linux** lo más directo es el script oficial o Homebrew. Con Node podés usar npm. En **Windows** los gestores de paquetes no están soportados: bajás el binario para tu procesador (x64 o ARM64) desde la documentación.",
        "Si tenías OpenCode 1 instalado con un gestor de paquetes, **desinstalalo antes**: las dos versiones usan el mismo comando `opencode`. Después de instalar, abrí una terminal nueva y probá `opencode --help`.",
      ],
      codigo: [
        code`
# macOS y Linux: script oficial (instala en ~/.opencode/bin)
curl -fsSL https://opencode.ai/v2/install | bash

# Homebrew (macOS y Linux)
brew install anomalyco/tap/opencode-v2

# npm (cualquier sistema con Node)
npm install -g @opencode/cli

# Arch Linux
paru -S opencode-beta

# app de escritorio: opencode.ai/download
brew install --cask opencode-desktop    # en macOS

opencode --help       # comprobar
opencode upgrade      # actualizar mas adelante`,
      ],
    },
    {
      heading: "Tu primera sesión paso a paso",
      parrafos: [
        "La primera vez OpenCode no tiene ningún proveedor conectado, así que lo primero es conectar uno. Seguí estos pasos en un proyecto con git, para poder volver atrás.",
      ],
      lista: [
        "Entrá a la carpeta del proyecto y corré `opencode`. Se abre la pantalla de inicio con la caja del prompt.",
        "Escribí `/connect`, elegí un proveedor y seguí los pasos: pegar una clave de API o iniciar sesión en el navegador. Si ya tenés **Ollama** corriendo, sus modelos aparecen solos.",
        "Escribí `/models` y elegí un modelo.",
        "Apretá Shift+Tab hasta ver **Plan** abajo de la caja y pedile algo para entender el proyecto: \"explicame la estructura de este repo\". El agente plan **no edita archivos**.",
        "Cuando quieras un cambio, volvé a **Build** con Shift+Tab y pedilo con detalle. Si algo no te gusta, `/undo` deshace el pedido y los archivos.",
        "Para salir, Ctrl+C. La sesión queda guardada: la retomás con `/sessions`.",
      ],
      codigo: [
        code`
cd mi-proyecto
git status            # que este todo commiteado
opencode
# dentro:
/connect
/models
Explicame la estructura de este repo y donde estan los tests`,
      ],
    },
    {
      heading: "Comandos esenciales",
      parrafos: [
        "Hay dos tipos: los **comandos de la terminal** (`opencode algo`), que corrés fuera de la TUI, y los **comandos de /**, que escribís dentro de una sesión. Cualquier comando acepta `--help`.",
        "Dentro de la TUI también importan tres prefijos: `@` para adjuntar un archivo, `!` para correr un comando de shell sin pasar por el modelo y `/` para la lista de comandos. Ctrl+P abre la paleta con todas las acciones.",
      ],
      codigo: [
        code`
# en la terminal
opencode                          # TUI en la carpeta actual
opencode run "pregunta"           # una sola vez, sin interfaz
opencode auth login               # conectar un proveedor
opencode models                   # listar modelos
opencode mcp add nombre --url URL # sumar un servidor MCP
opencode session list             # sesiones guardadas
opencode upgrade                  # actualizar
opencode debug paths              # donde guarda todo

# dentro de la sesion
/connect  /models  /agents  /new  /sessions
/undo  /redo  /mcps  /editor  /btw pregunta`,
      ],
    },
    {
      heading: "Configuración",
      parrafos: [
        "La configuración va en `opencode.json` o `opencode.jsonc` (la versión con comentarios). La **global** vive en `~/.config/opencode/` y la **del proyecto** en la raíz o en `.opencode/`. OpenCode **combina** todos los archivos que encuentra: lo más cercano a tu carpeta pisa lo más general.",
        "Las instrucciones para el agente van aparte, en `AGENTS.md`. Se carga el global (`~/.config/opencode/AGENTS.md`) más todos los que haya desde tu carpeta hasta la raíz del proyecto. La versión 2 **no lee** `CLAUDE.md`.",
        "Las claves nunca se escriben en el archivo: se usa `{env:VARIABLE}` para leerlas del entorno o `{file:ruta}` para leerlas de un archivo aparte. Los ajustes de la interfaz de terminal (tema, atajos) van en otro archivo, `cli.json`.",
      ],
      codigo: [
        code`
// opencode.jsonc
{
  "\$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-5-5",   // modelo por defecto
  "default_agent": "build",
  "instructions": ["CONTRIBUTING.md"],      // ademas de AGENTS.md
  "permissions": [
    { "action": "shell", "resource": "*", "effect": "ask" },
    { "action": "shell", "resource": "git status *", "effect": "allow" },
    { "action": "shell", "resource": "git push *", "effect": "deny" }
  ],
  "mcp": {
    "servers": {
      "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" }
    }
  }
}`,
      ],
    },
    {
      heading: "Modelos que puede usar",
      parrafos: [
        "Un modelo se nombra `proveedor/modelo`, por ejemplo `anthropic/claude-sonnet-5-5`, y algunos aceptan una **variante** después de `#` para subir o bajar el esfuerzo de razonamiento (`#high`). Los nombres cambian seguido: elegilos con `/models` en vez de memorizarlos.",
        "Lo que pagás depende del proveedor, no de OpenCode. Los precios de cada modelo están en la página del proveedor; los de las suscripciones propias de OpenCode (Go y Console), en su documentación.",
      ],
      tabla: {
        cabeza: ["Modelo o proveedor", "Para qué", "Dónde está disponible"],
        filas: [
          ["Claude (Anthropic)", "Tareas largas de código y refactors", "Clave de API de Anthropic, Bedrock, Vertex u OpenRouter"],
          ["GPT (OpenAI)", "Código y razonamiento", "Clave de API o **iniciar sesión con ChatGPT** Plus o Pro"],
          ["Modelos de GitHub Copilot", "Usar la suscripción de Copilot que ya tenés", "Proveedor Copilot, con tu cuenta de GitHub"],
          ["Modelos gratis de OpenCode", "Probar sin pagar", "Catálogo de OpenCode (se pueden ocultar con `OPENCODE_DISABLE_FREE_MODELS=1`)"],
          ["OpenCode Go", "Modelos abiertos con precio mensual fijo", "Suscripción opcional en opencode.ai/console"],
          ["Ollama, LM Studio, vLLM", "Trabajar **sin mandar el código afuera**", "Tu propia máquina o un servidor tuyo"],
        ],
      },
    },
    {
      heading: "Cómo se ve",
      parrafos: [
        "Al abrir `opencode` aparece la pantalla de inicio: el logo en letras de bloques, la caja donde escribís y, abajo, el **agente** activo (Build o Plan) y el **modelo**. Debajo de la caja está la carpeta con la rama de git y los dos atajos que más vas a usar: Shift+Tab para cambiar de agente y Ctrl+P para los comandos.",
        "Cuando mandás un pedido, la pantalla pasa a la conversación: tus mensajes, lo que el agente va haciendo (cada herramienta que usa) y los cambios como diff. Si una acción necesita permiso, la TUI te la muestra y espera tu respuesta.",
      ],
      captura: {
        tipo: "terminal",
        titulo: "opencode — ~/my-app",
        lineas: [
          [],
          [{ t: "                          " }, { t: "             █", c: "fuerte" }],
          [{ t: "      " }, { t: "████ ████ ████ ████", c: "tenue" }, { t: " " }, { t: "████ ████ ████ ████", c: "fuerte" }],
          [{ t: "      " }, { t: "█  █ █  █ █▄▄█ █  █", c: "tenue" }, { t: " " }, { t: "█    █  █ █  █ █▄▄█", c: "fuerte" }],
          [{ t: "      " }, { t: "████ ████ █▄▄▄ █  █", c: "tenue" }, { t: " " }, { t: "████ ████ ████ █▄▄▄", c: "fuerte" }],
          [{ t: "      " }, { t: "     █", c: "tenue" }],
          [],
          [{ t: "  " }, { t: "┃", c: "acento" }, { t: "  Ask anything… \"Fix a TODO in the codebase\"", c: "tenue" }],
          [{ t: "  " }, { t: "┃", c: "acento" }],
          [{ t: "  " }, { t: "┃", c: "acento" }, { t: "  " }, { t: "Build", c: "acento" }, { t: " · ", c: "tenue" }, { t: "Claude Opus 5.5", c: "fuerte" }, { t: " OpenCode", c: "tenue" }],
          [{ t: "  ~/my-app:main", c: "tenue" }, { t: "                   " }, { t: "shift+tab", c: "fuerte" }, { t: " agents  ", c: "tenue" }, { t: "ctrl+p", c: "fuerte" }, { t: " commands", c: "tenue" }],
          [],
          [{ t: "                                                                   2.2.5", c: "tenue" }],
        ],
        pie: "La pantalla de inicio de la TUI de OpenCode: el logo, la caja del prompt con el agente y el modelo, la carpeta con la rama y los atajos. Recreación de la pantalla de OpenCode 2.2.5 según el material de prensa oficial, no es una captura.",
      },
    },
    {
      heading: "Cómo se ve la app",
      parrafos: [
        "La **app de escritorio** (macOS, Windows y Linux) es otro cliente del mismo servidor. A la izquierda tiene la lista de sesiones, en el centro la conversación y a la derecha un panel con los **archivos y el diff de git**, para revisar cada cambio antes de aceptarlo. Podés tener varias sesiones abiertas a la vez.",
      ],
      captura: {
        tipo: "app",
        titulo: "OpenCode",
        paneles: [
          {
            nombre: "Sesiones",
            lineas: [
              [{ t: "Home" }],
              [{ t: "Search sessions", c: "tenue" }],
              [{ t: "New session", c: "tenue" }],
              [],
              [{ t: "A ", c: "tenue" }, { t: "Antarctica trailer page" }],
              [{ t: "B ", c: "tenue" }, { t: "Browse extension" }],
              [{ t: "S ", c: "tenue" }, { t: "Fix checkout tests" }],
              [{ t: "A Write the press kit copy", c: "sel" }],
            ],
          },
          {
            nombre: "Conversación",
            ancho: 2,
            lineas: [
              [{ t: "antarctica-site / ", c: "tenue" }, { t: "Write the press kit copy", c: "fuerte" }],
              [],
              [{ t: "   Write the press kit copy: a short intro", c: "fuerte" }],
              [{ t: "   and three facts about the trip", c: "fuerte" }],
              [],
              [{ t: "Working", c: "tenue" }],
            ],
          },
          {
            nombre: "Files · Git",
            lineas: [
              [{ t: "M ", c: "acento" }, { t: "archivo modificado", c: "tenue" }],
              [{ t: " 1  import …", c: "tenue" }],
              [{ t: " 2  import …", c: "ok" }],
              [{ t: " 3", c: "tenue" }],
              [{ t: " 4  export …", c: "tenue" }],
              [{ t: "11  …", c: "ok" }],
              [{ t: "12  …", c: "ok" }],
            ],
          },
        ],
        pie: "La app de escritorio de OpenCode con una sesión trabajando: sesiones a la izquierda, la conversación en el centro y los archivos con el diff de git a la derecha. Recreación de la app de escritorio según el material de prensa oficial de noviembre de 2026, no es una captura.",
      },
    },
    {
      heading: "Seguridad y buenas prácticas",
      parrafos: [
        "Lo más importante para entender: OpenCode **no tiene sandbox**. Controla al agente con **reglas de permisos** (`allow`, `ask`, `deny`), y la regla de fábrica es permitir casi todo: solo pregunta antes de leer archivos `.env`. Un comando que se ejecuta lo hace con todo lo que puede hacer tu usuario.",
        "Por eso conviene ajustar los permisos el primer día y empezar con el agente **plan** cuando el código no es tuyo. Para tareas riesgosas, corré OpenCode dentro de un contenedor o una máquina descartable.",
      ],
      lista: [
        "Poné `shell` en `ask` y abrí solo los comandos inofensivos (`git status`, `git diff`, tus tests). `git push` y `rm` en `deny`.",
        "Agregá una regla `ask` para `external_directory` si no querés que toque carpetas fuera del proyecto.",
        "Las claves van con `/connect`, `opencode auth login` o `{env:VARIABLE}`, nunca escritas en `opencode.json` ni en el chat.",
        "Todo lo que viene de afuera (una web, un README ajeno, un `AGENTS.md` de un repo clonado, un servidor MCP) puede traer **instrucciones escondidas**. No es una orden tuya.",
        "Los plugins son código que corre en tu máquina, y los comandos propios con bloques de shell se ejecutan fuera del control de permisos: instalá solo lo que conozcas.",
        "Commit antes de cada cambio grande, y leé el diff antes de aceptarlo. `/undo` ayuda, pero no reemplaza a git.",
      ],
    },
    {
      heading: "Errores comunes",
      lista: [
        "Escribir un `CLAUDE.md` y **esperar que OpenCode lo lea**: la versión 2 solo lee `AGENTS.md`.",
        "Usar configuración de la versión 1: en la 2 las claves son `permissions` (no `permission`), `shell` (no `bash`) y los MCP van bajo `mcp.servers`.",
        "Creer que \"no hay ningún modelo\": falta conectar un proveedor con `/connect`, o el modelo no está disponible en ese proyecto.",
        "Poner la clave de API en el entorno de tu terminal y que no ande: la usa el **servidor de fondo**, que puede haber arrancado antes. Usá `opencode service set env` o `--standalone`.",
        "Usar `opencode run --auto` en CI sin reglas `deny`: aprueba todo lo demás.",
        "Esperar que un modelo local chico rinda como uno grande: puede no saber usar bien las herramientas. Probá primero con tareas chicas.",
        "Instalar la versión 2 sin desinstalar antes la 1 de un gestor de paquetes: las dos usan el mismo comando `opencode`.",
      ],
      parrafos: [
        "Casi todos estos problemas se diagnostican con dos comandos: `opencode debug config` (qué archivos de configuración se cargaron) y `opencode service status` (si el servidor de fondo está andando).",
      ],
    },
    {
      heading: "Comparación con Claude Code y Codex",
      parrafos: [
        "Los tres hacen lo mismo en lo esencial: leen tu proyecto, actúan con herramientas y te piden permiso. Cambia **de quién son los modelos**, cómo se controla lo que el agente puede hacer y qué archivo de instrucciones leen.",
      ],
      tabla: {
        cabeza: ["", "OpenCode", "Claude Code", "Codex"],
        filas: [
          ["Quién lo hace", "Anomaly, código abierto (MIT)", "Anthropic", "OpenAI"],
          ["Modelos", "**Cualquier proveedor**, también locales", "Modelos de Anthropic", "Modelos de OpenAI"],
          ["Cuenta", "La del proveedor que conectes", "Cuenta de Claude o clave de API", "Cuenta de ChatGPT o clave de API"],
          ["Instrucciones", "`AGENTS.md`", "`CLAUDE.md`", "`AGENTS.md`"],
          ["Control", "Reglas `allow`/`ask`/`deny`, sin sandbox", "Modos de permisos", "Sandbox más aprobación"],
          ["Sin interfaz", "`opencode run`", "`claude -p`", "`codex exec`"],
          ["Dónde corre", "Terminal, escritorio, web, celular", "Terminal, IDE, escritorio, web", "Terminal, IDE, app, nube"],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Practicá con un proyecto chico: conectá un proveedor, escribí un `AGENTS.md` de cinco líneas, armá tus reglas de permisos y pedile al agente plan que te explique el código antes de cambiar nada.",
        "Después probá lo que hace distinto a OpenCode: **cambiar de modelo en la misma sesión** con `/models`, correr un modelo local con Ollama, crear un subagente propio en `.opencode/agents/` o un comando en `.opencode/commands/`.",
        "La fuente que se mantiene al día es la documentación oficial en opencode.ai/docs, y las novedades de cada versión están en el changelog del sitio. Para los comandos concretos, volvé a la pestaña Referencia de este tema.",
      ],
    },
  ],
  fuentes: [
    { texto: "Documentación de OpenCode: introducción e instalación", url: "https://opencode.ai/docs" },
    { texto: "Repositorio oficial en GitHub", url: "https://github.com/anomalyco/opencode" },
    { texto: "Kit de prensa: historia, productos y capturas", url: "https://opencode.ai/press" },
    { texto: "TUI", url: "https://opencode.ai/docs/cli/tui" },
    { texto: "Comandos de la CLI", url: "https://opencode.ai/docs/cli/commands" },
    { texto: "Agentes", url: "https://opencode.ai/docs/agents" },
    { texto: "Instrucciones y AGENTS.md", url: "https://opencode.ai/docs/instructions" },
    { texto: "Configuración", url: "https://opencode.ai/docs/config" },
    { texto: "Permisos", url: "https://opencode.ai/docs/permissions" },
    { texto: "Modelos", url: "https://opencode.ai/docs/models" },
    { texto: "Proveedores", url: "https://opencode.ai/docs/providers" },
    { texto: "Servidores MCP", url: "https://opencode.ai/docs/mcp-servers" },
    { texto: "Migrar desde la versión 1", url: "https://opencode.ai/docs/migrate-v1" },
  ],
  revisada: "2026-11-14",
};
