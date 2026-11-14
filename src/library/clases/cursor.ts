import { type Clase, code } from "../types";

export const claseCursor: Clase = {
  titulo: "Cursor de cero: el editor, el agente y la CLI",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es **Cursor**, de dónde viene, cómo trabaja el agente por dentro, " +
    "cómo instalarlo y usarlo la primera vez, qué modelos puede usar, cómo se ve y qué cuidar para no llevarte sorpresas.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Cursor es un **editor de código con IA** hecho por Anysphere. Está armado sobre VS Code (es un fork): se ve y se maneja casi igual, usa los mismos atajos y acepta sus extensiones, pero suma funciones de IA metidas en el propio editor.",
        "Tiene tres capas. El autocompletado (Tab) te sugiere código mientras escribís. El **Agent** es un agente de programación: lee tu proyecto, edita archivos, corre comandos en la terminal y prueba en un navegador. Y los **Cloud Agents** hacen lo mismo en una máquina en la nube, mientras vos seguís con otra cosa. Además hay una CLI, `agent`, para usar el agente desde la terminal.",
        "El problema que ataca es el **ida y vuelta entre el chat y el editor**. En vez de copiar código a una ventana de chat y pegar la respuesta, el agente trabaja directo sobre tus archivos y te muestra un diff para que lo revises antes de aceptarlo.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Cursor empezó como un editor con autocompletado y un chat al costado, y con el tiempo el centro pasó al agente. Hoy la propia documentación lo presenta como \"un agente de programación para construir software ambicioso\".",
      ],
      lista: [
        "La edición en línea con `Cmd+K`, una de sus primeras funciones, fue reemplazada: hoy ese atajo manda el código seleccionado al Agent.",
        "La función Memories, que guardaba datos entre chats, también se quitó; su lugar lo ocupan las reglas.",
        "2 de abril de 2026: sale **Cursor 3**, con la Agents Window, una interfaz centrada en agentes además del IDE de siempre.",
        "Abril de 2026: Cursor anuncia que entrena modelos junto con SpaceX (SpaceXAI). De ahí salen los modelos Grok 4.5, 4.6 y 4.7 que trae Cursor.",
        "14 de agosto de 2026: Cursor pasa a ser parte de SpaceX.",
        "Octubre y noviembre de 2026: el Agent SDK, apps publicadas por agentes en la nube y chat por voz. La app va por la 3.30.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      diagrama: "bucle",
      parrafos: [
        "El Agent tiene tres piezas: las **instrucciones** (el prompt del sistema más tus reglas), las **herramientas** y el **modelo** que elegiste. Cada pedido arranca un bucle: el modelo lee tu pedido y el contexto, decide una acción (buscar, leer un archivo, editar, correr un comando, abrir el navegador), la herramienta la ejecuta y el resultado vuelve al modelo para el paso siguiente. No hay límite de llamadas a herramientas.",
        "Para encontrar código usa Instant Grep, un buscador que arma su índice en tu máquina, y para búsquedas amplias puede abrir un subagente (Explore) con su propia ventana de contexto. Lo que lee de un archivo sí viaja al proveedor del modelo como parte del pedido.",
        "Antes de cada acción entran las **Run Modes**: lo que está en tu allowlist corre directo, el resto corre en un sandbox que limita carpetas y red, y lo que no entra en el sandbox pasa por un clasificador o te pregunta. Antes de cambios grandes guarda un checkpoint, para poder volver atrás.",
      ],
    },
    {
      heading: "Instalación paso a paso",
      parrafos: [
        "La app se baja de `cursor.com/download`. Necesitás macOS 12 o más nuevo (hay versión para Apple Silicon, Intel y universal), Windows 10 o más nuevo (instalador de usuario o de sistema, x64 o ARM64) o Linux. En Linux conviene el **repositorio apt o dnf**: trae el ícono, las actualizaciones automáticas y las herramientas de línea de comandos. Si no, hay `.deb`, `.rpm` y AppImage.",
        "La CLI se instala aparte, con un script. Deja el comando `agent` en `~/.local/bin`, así que esa carpeta tiene que estar en tu `PATH`.",
      ],
      codigo: [
        code`
# Debian/Ubuntu: agregar la clave y el repositorio, e instalar
curl -fsSL https://downloads.cursor.com/keys/anysphere.asc | gpg --dearmor | sudo tee /etc/apt/keyrings/cursor.gpg > /dev/null
echo "deb [arch=amd64,arm64 signed-by=/etc/apt/keyrings/cursor.gpg] https://downloads.cursor.com/aptrepo stable main" | sudo tee /etc/apt/sources.list.d/cursor.list > /dev/null
sudo apt update
sudo apt install cursor

# Fedora/RHEL: crear /etc/yum.repos.d/cursor.repo y despues
sudo dnf install cursor

# AppImage (portable)
chmod +x Cursor-*.AppImage
./Cursor-*.AppImage`,
        code`
# la CLI
curl https://cursor.com/install -fsS | bash          # macOS, Linux y WSL
irm 'https://cursor.com/install?win32=true' | iex   # Windows (PowerShell)

export PATH="\$HOME/.local/bin:\$PATH"   # agregalo a ~/.bashrc o ~/.zshrc
agent --version`,
      ],
    },
    {
      heading: "Tu primera sesión paso a paso",
      parrafos: [
        "Arrancá con algo chico y que puedas revisar entero. La idea es conocer el ritmo del agente antes de pedirle algo grande.",
      ],
      lista: [
        "Abrí Cursor e **iniciá sesión** con tu cuenta (crearla es gratis).",
        "Si venías de VS Code: `Cmd+Shift+J` (`Ctrl+Shift+J` en Windows/Linux) abre Cursor Settings; en General > Account, VS Code Import > Import trae extensiones, temas, settings y atajos.",
        "File > Open Folder y elegí tu proyecto. Mejor si tiene git y un commit limpio.",
        "Abrí el Agent con `Cmd+I` (`Ctrl+I`) y pedile que te explique el proyecto: cuáles son los puntos de entrada y qué conviene leer primero.",
        "Pedile tres mejoras chicas y de bajo riesgo, y elegí una.",
        "**Revisá el diff** antes de aceptar. Después pedile que corra los chequeos que ya tiene el proyecto: tests, typecheck, lint o el build.",
        "Para algo más grande, apretá `Shift+Tab` hasta Plan: va a preguntarte, armar un plan y esperar tu visto bueno antes de tocar código.",
      ],
    },
    {
      heading: "Comandos esenciales",
      parrafos: [
        "En el editor casi todo pasa por atajos. Los de Mac usan `Cmd`; en Windows y Linux, `Ctrl`. Como Cursor hereda los atajos de VS Code, los de siempre (paleta de comandos, buscar archivos) **siguen igual**.",
        "En la CLI, `agent` abre la sesión interactiva y lo que empieza con `/` cambia el modo, el modelo o la sesión. Con `-p` **responde una vez y termina**, para scripts y CI.",
      ],
      codigo: [
        code`
# en el editor (Mac; en Windows/Linux, Ctrl en vez de Cmd)
Cmd+I            # abrir o cerrar el Agent
Cmd+K / Cmd+L    # con codigo seleccionado: llevarlo al Agent
Shift+Tab        # rotar modos: Agent, Plan, Ask, Debug
Cmd+/            # rotar modelos
Tab              # aceptar la sugerencia de autocompletado
Cmd+Enter        # con cambios propuestos: aceptarlos todos
Cmd+Shift+J      # Cursor Settings
Cmd+Shift+P      # paleta: "Open Agents Window" / "Open IDE"`,
        code`
# en la terminal
agent                         # sesion interactiva
agent --plan "agrega login"   # arrancar en Plan
agent ls                      # chats anteriores
agent resume                  # retomar el ultimo
agent -p "resumi el diff"     # una sola vez, sin preguntar nada
/model  /plan  /ask  /clear  /summarize  /help  /quit`,
      ],
    },
    {
      heading: "Configuración",
      parrafos: [
        "Lo más importante son las **reglas**: instrucciones que el agente lee en cada pedido. Las del proyecto van en `.cursor/rules`, una por archivo `.mdc`, con un encabezado que dice cuándo aplicarlas: siempre (`alwaysApply`), cuando el agente crea que hace falta (`description`), para ciertos archivos (`globs`) o solo si la mencionás con @. Un `AGENTS.md` en la raíz también vale, y puede haber otros en subcarpetas.",
        "Los servidores MCP se declaran en `.cursor/mcp.json` (del proyecto) o `~/.cursor/mcp.json` (para todos). La CLI tiene su propia configuración en `~/.cursor/cli-config.json`, y en el proyecto `.cursor/cli.json` solo admite permisos.",
      ],
      codigo: [
        code`
# .cursor/rules/estilo.mdc
---
description: Estilo de codigo del proyecto
alwaysApply: true
---
- TypeScript estricto, sin any
- Tests con vitest: npm test
- No toques la carpeta dist/`,
        { lang: "formats", text: code`
// .cursor/mcp.json
{
  "mcpServers": {
    "docs": { "url": "https://ejemplo.com/mcp" },
    "local": { "command": "npx", "args": ["-y", "mcp-server"] }
  }
}` },
        { lang: "formats", text: code`
// ~/.cursor/cli-config.json
{
  "version": 1,
  "editor": { "vimMode": false },
  "permissions": {
    "allow": ["Shell(ls)", "Read(src/**)"],
    "deny":  ["Shell(rm)", "Read(.env*)"]
  }
}` },
      ],
    },
    {
      heading: "Modelos que puede usar",
      parrafos: [
        "A diferencia de Claude Code o Codex, Cursor no está atado a un proveedor: trae **modelos propios** (Composer, y los Grok entrenados con SpaceXAI) y también de Anthropic, OpenAI, Google y otros. Muchos de terceros vienen ocultos y hay que activarlos, y cuáles ves depende de tu plan: en Free y Plus no hay modelos de terceros.",
        "**Auto** elige el modelo por vos. En planes individuales usa los modelos de Cursor; en Teams y Enterprise puede usar el Cursor Router para elegir también entre los de terceros. Los nombres cambian seguido: confirmalos en el selector o con `agent models`.",
      ],
      tabla: {
        cabeza: ["Modelo", "Para qué", "Dónde está disponible"],
        filas: [
          ["Composer 2.5", "modelo propio de Cursor para trabajo largo con herramientas; la variante rápida es la de uso interactivo", "todos los planes pagos (pool de modelos de Cursor)"],
          ["Grok 4.7 / 4.6 / 4.5", "modelos entrenados por Cursor y SpaceXAI, para programar con agentes", "todos los planes pagos (pool de modelos de Cursor)"],
          ["Claude Opus 5.5, Sonnet 5.5, Fable 5.2, Haiku 5.5", "modelos de Anthropic, del más capaz al más rápido", "desde Premium, Teams y Enterprise"],
          ["GPT-5.6 Sol / Terra / Luna", "modelos de OpenAI, en varios tamaños", "desde Premium, Teams y Enterprise"],
          ["Gemini 4 Argon / Carbon / Hydrogen, Gemini 3.1 Pro", "modelos de Google", "desde Premium, Teams y Enterprise"],
          ["Auto", "elige el modelo según el pedido", "Cost en planes individuales; Balance e Intelligence en Teams y Enterprise"],
        ],
      },
    },
    {
      heading: "Cómo se ve la CLI",
      parrafos: [
        "Al escribir `agent` en una carpeta aparece arriba el nombre, **Cursor Agent**, con la carpeta y la rama de git. Abajo está la caja donde escribís el pedido, y debajo una línea con el modelo elegido y las tres teclas para recordar: `/` para comandos, `@` para archivos y `!` para correr un comando de shell.",
      ],
      captura: {
        tipo: "terminal",
        titulo: "agent — ~/anysphere/research",
        lineas: [
          [{ t: "Cursor Agent", c: "fuerte" }],
          [{ t: "~/anysphere/research · main", c: "tenue" }],
          [],
          [{ t: "→ ", c: "acento" }, { t: "Plan, search, build anything", c: "tenue" }],
          [],
          [{ t: "  GPT-5.6 Sol Extra High Fast", c: "acento" }],
          [{ t: "  / commands · @ files · ! shell", c: "tenue" }],
        ],
        pie: "La pantalla inicial de la CLI. Recreación de la pantalla de Cursor CLI (agent, noviembre 2026) según la maqueta de cursor.com/cli (los colores son aproximados), no es una captura.",
      },
    },
    {
      heading: "Cómo se ve la app",
      parrafos: [
        "En la **Agents Window** (la vista que trae Cursor 3) la barra lateral izquierda lista tus agentes: los que están trabajando y los que esperan revisión, cada uno con lo que está haciendo. En el centro queda el editor con pestañas, y a la derecha el panel del agente con el plan, las tareas, el modelo y el modo elegidos, y la caja para seguir la conversación.",
        "Si preferís la vista de siempre, \"Open IDE\" en la paleta te lleva al editor clásico de VS Code, con el explorador de archivos a la izquierda y el Agent en el panel lateral. Podés tener las dos abiertas.",
      ],
      captura: {
        tipo: "app",
        titulo: "Cursor",
        paneles: [
          {
            nombre: "Agentes",
            ancho: 1,
            lineas: [
              [{ t: "In Progress 2", c: "tenue" }],
              [{ t: "Build Landing Page", c: "fuerte" }],
              [{ t: " Reading docs", c: "tenue" }],
              [{ t: "Plan Mission Control", c: "sel" }],
              [{ t: " Generating plan", c: "tenue" }],
              [],
              [{ t: "Ready for Review 3", c: "tenue" }],
              [{ t: "PyTorch MNIST Exp…", c: "fuerte" }, { t: " 10m", c: "tenue" }],
              [{ t: "Set up Cursor Rules", c: "fuerte" }, { t: " 30m", c: "tenue" }],
              [{ t: "Bioinformatics Tools", c: "fuerte" }, { t: " 45m", c: "tenue" }],
            ],
          },
          {
            nombre: "Editor",
            ancho: 1.4,
            lineas: [
              [{ t: "feature-prd.md", c: "sel" }, { t: "  presence.ts", c: "tenue" }],
              [],
              [{ t: "# Mission Control Interface", c: "fuerte" }],
              [],
              [{ t: "## Trigger", c: "acento" }],
              [{ t: "…", c: "tenue" }],
              [],
              [{ t: "## View Behavior", c: "acento" }],
              [{ t: "…", c: "tenue" }],
            ],
          },
          {
            nombre: "Agente",
            ancho: 1.4,
            lineas: [
              [{ t: "Plans", c: "fuerte" }],
              [{ t: "feature-prd.md", c: "tenue" }],
              [],
              [{ t: "3 Tasks", c: "fuerte" }],
              [{ t: "· Add multiplayer mode to", c: "tenue" }],
              [{ t: "  useAppStore.ts", c: "tenue" }],
              [{ t: "· Create MissionControlView.tsx", c: "tenue" }],
              [],
              [{ t: "Add a follow up...", c: "tenue" }],
              [{ t: "Grok 4.7", c: "acento" }, { t: " · Build", c: "tenue" }],
            ],
          },
        ],
        pie: "La Agents Window con un plan en marcha. Recreación de la pantalla de Cursor 3 según la maqueta de cursor.com (textos resumidos, colores aproximados), no es una captura.",
      },
    },
    {
      heading: "Seguridad y buenas prácticas",
      parrafos: [
        "El agente **edita archivos del proyecto sin preguntarte**, y los cambios se escriben al disco en el momento. Por eso la primera regla es trabajar con git: commit o rama antes de algo grande, y revisar el diff antes de aceptar. Los checkpoints ayudan, pero son locales y no reemplazan a git.",
        "Para los comandos, quedate con **Auto-review**, el modo recomendado. La propia documentación avisa que las Run Modes son una barrera de mejor esfuerzo, no un límite duro, así que Run Everything (o `--force` en la CLI) es solo para algo descartable.",
      ],
      lista: [
        "`.cursorignore` frena al agente, pero no a la terminal ni a los MCP: un `cat .env` igual lee el archivo.",
        "Por defecto el agente puede leer fuera del proyecto. Si no querés eso, limitalo a workspace.",
        "Lo que viene de afuera (una web, un issue, un repo clonado, un MCP) puede traer **prompt injection**. Activá Workspace Trust para repos ajenos y revisá su carpeta `.cursor/`.",
        "Agregá solo servidores MCP confiables, con credenciales de solo lectura cuando se pueda, y no subas claves en `mcp.json`.",
        "Privacy Mode evita que se entrene con tu código, pero tu pedido igual viaja al proveedor del modelo: no pegues secretos en el chat.",
      ],
    },
    {
      heading: "Errores comunes",
      parrafos: [
        "La mayoría de los problemas de quien recién empieza no son del modelo, sino de lugares y nombres que cambiaron o que se parecen.",
      ],
      lista: [
        "Escribir reglas en `.cursor/rules/algo.md`: **se ignoran**. Tienen que terminar en `.mdc` (o ir en `AGENTS.md`).",
        "Buscar la vieja edición en línea con `Cmd+K`: ya no existe; hoy ese atajo lleva la selección al Agent.",
        "Esperar que el agente \"se acuerde\" de un chat anterior: Memories se quitó. Lo que tiene que durar va en reglas.",
        "No encontrar una extensión de VS Code: Cursor usa Open VSX, y algunas no están o se comportan distinto.",
        "Correr `agent` y que diga que no existe: falta `~/.local/bin` en el `PATH`.",
        "Usar `agent -p` en CI y que no haga nada: sin `--force` rechaza lo que necesita aprobación. Y sin `CURSOR_API_KEY` no se autentica.",
        "Pedir Cloud Agents o Claude en Free o Plus: no vienen en esos planes.",
      ],
    },
    {
      heading: "Comparación con Claude Code y Codex",
      parrafos: [
        "Los tres son agentes que leen tu proyecto, piden permiso y trabajan en un bucle de leer, actuar y verificar. La diferencia más grande es **dónde viven**: Cursor es ante todo un editor con agente adentro; Claude Code y Codex nacieron en la terminal y se suman a tu editor con una extensión (incluso adentro de Cursor).",
      ],
      tabla: {
        cabeza: ["Aspecto", "Cursor", "Claude Code", "Codex"],
        filas: [
          ["Dónde corre", "app (fork de VS Code), Agents Window, CLI `agent`, nube", "CLI `claude`, extensiones, app y web", "CLI `codex`, extensión, app de ChatGPT, Codex Cloud"],
          ["Instrucciones", "`.cursor/rules/*.mdc` y `AGENTS.md` (la CLI también `CLAUDE.md`)", "`CLAUDE.md` (o `AGENTS.md` si no hay)", "`AGENTS.md`"],
          ["Modelos", "propios (Composer, Grok) y de Anthropic, OpenAI, Google y otros", "Claude", "modelos de OpenAI"],
          ["Permisos", "Run Modes (Auto-review, Allowlist, Run Everything) y sandbox", "modos de permisos (default, plan, auto, bypassPermissions…)", "sandbox y aprobación, por separado"],
          ["Autocompletado", "sí, Tab", "no", "no"],
          ["Revisión de PRs", "Bugbot", "según la integración", "`@codex review` en GitHub"],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Practicá con **el ciclo completo** en un proyecto propio: una regla corta en `.cursor/rules`, un pedido en Plan, revisar el diff, correr los tests. Cuando eso salga solo, probá la CLI y después un Cloud Agent con una tarea que no te apure.",
        "Los modelos, los planes y hasta los atajos cambian seguido. La fuente más confiable es la documentación oficial en `cursor.com/docs` y el changelog en `cursor.com/changelog`. Para los comandos del día a día, volvé a la pestaña Referencia de este mismo tema.",
      ],
    },
  ],
  fuentes: [
    { texto: "Documentación de Cursor", url: "https://cursor.com/docs" },
    { texto: "Quickstart e instalación", url: "https://cursor.com/docs/get-started/quickstart" },
    { texto: "Descargas", url: "https://cursor.com/download" },
    { texto: "Migrar desde VS Code", url: "https://cursor.com/help/getting-started/migrate-vscode" },
    { texto: "Tab", url: "https://cursor.com/help/ai-features/tab" },
    { texto: "Agent", url: "https://cursor.com/docs/agent/overview" },
    { texto: "Plan Mode", url: "https://cursor.com/docs/agent/plan-mode" },
    { texto: "Agents Window", url: "https://cursor.com/docs/agent/agents-window" },
    { texto: "Reglas", url: "https://cursor.com/docs/rules" },
    { texto: "MCP", url: "https://cursor.com/docs/mcp" },
    { texto: "Run Modes", url: "https://cursor.com/docs/agent/security/run-modes" },
    { texto: "Seguridad del agente", url: "https://cursor.com/docs/agent/security" },
    { texto: "Cloud Agents", url: "https://cursor.com/docs/cloud-agent" },
    { texto: "Bugbot", url: "https://cursor.com/docs/bugbot" },
    { texto: "CLI", url: "https://cursor.com/docs/cli/overview" },
    { texto: "Modelos y precios", url: "https://cursor.com/docs/models-and-pricing" },
    { texto: "Privacidad", url: "https://cursor.com/help/security-and-privacy/privacy" },
    { texto: "Atajos de teclado", url: "https://cursor.com/docs/reference/keyboard-shortcuts" },
    { texto: "Cursor es parte de SpaceX", url: "https://cursor.com/blog/joining-spacex" },
  ],
  revisada: "2026-11-14",
};
