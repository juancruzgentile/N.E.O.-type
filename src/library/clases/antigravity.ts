import { type Clase, code } from "../types";

export const claseAntigravity: Clase = {
  titulo: "Antigravity de cero: la app, la CLI y cómo trabajar con agentes",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es Antigravity, de dónde viene, cómo trabaja el agente por dentro, " +
    "cómo instalarlo y usarlo la primera vez, qué modelos puede usar, cómo se ve y qué cuidar para no llevarte sorpresas.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Antigravity es la **plataforma de desarrollo con agentes** de Google. Un agente es un modelo de lenguaje que, además de responder, puede usar herramientas: leer y editar archivos, correr comandos en una terminal y manejar un navegador para probar lo que hizo.",
        "Hoy es una familia de productos que comparten el mismo motor (el \"harness\" del agente): la **app de escritorio**, pensada para lanzar, seguir y revisar el trabajo de los agentes; la CLI `agy`, para la terminal; extensiones para VS Code, Visual Studio, JetBrains, Zed, Xcode y Eclipse; el Antigravity IDE original; y un SDK de Python para armar agentes propios.",
        "El problema que ataca es **revisar trabajo delegado**. Si un agente edita veinte archivos, mirar cada paso es imposible. Antigravity le hace entregar **artefactos** (un plan, un diff, un informe de verificación, capturas o grabaciones del navegador) para que revises en puntos clave en vez de vigilar todo el tiempo.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Google lo presentó el 18 de noviembre de 2025 como un **IDE con agentes**: tenía una vista de editor (autocompletado con Tab, un panel lateral con el agente) y otra vista llamada **Agent Manager**, una especie de \"centro de control\" para lanzar y seguir varios agentes en paralelo. Era gratis para individuos durante la vista previa.",
        "En mayo de 2026 el Agent Manager se convirtió en un producto aparte: la app de escritorio de Antigravity 2.0. El IDE original sigue existiendo, pero Google recomienda usar la app junto con el editor que prefieras.",
      ],
      lista: [
        "18 de noviembre de 2025: lanzamiento del Antigravity IDE, con Gemini 3 Pro, Claude Sonnet 4.5 y GPT-OSS.",
        "19 de mayo de 2026 (Google I/O): **Antigravity 2.0** (la app de escritorio sin IDE), la CLI, el SDK, subagentes, hooks y tareas programadas.",
        "Mayo de 2026: adopta el estándar abierto de Agent Skills; los workflows quedan obsoletos.",
        "Agosto de 2026: extensiones para otros IDE, agentes personalizados y control remoto.",
        "Noviembre de 2026: modelos Gemini 4 Carbon y Hydrogen, el Orchestrator, `/swarm` y el modo de voz. La app va por la 2.32.0.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      diagrama: "bucle",
      parrafos: [
        "Cada pedido arranca un **bucle**: el modelo lee tu pedido y el contexto (las reglas del proyecto, los archivos que mencionaste), decide una acción (leer un archivo, editar, correr un comando, abrir una página), la herramienta la ejecuta y el resultado vuelve al modelo, que decide el paso siguiente. Así hasta que termina o te necesita.",
        "Antes de cada acción entran los **permisos**: una regla puede aprobarla, pedirte confirmación o negarla, y el sandbox de la terminal limita a qué carpetas y a qué red llega un comando. El navegador es otra herramienta más, manejada por un subagente, con sus propias reglas.",
        "Para tareas grandes, el agente puede abrir **subagentes** que trabajan en paralelo, cada uno en su propio worktree de git para no pisarse. Y cuando le das una forma de verificarse (los tests, el build), puede cerrar el bucle solo y dejarte un informe de verificación.",
      ],
    },
    {
      heading: "Instalación paso a paso",
      parrafos: [
        "La app se baja de `antigravity.google/download`. Necesitás macOS 13 o más nuevo, Windows 10/11 de 64 bits, o un Linux con glibc 2.28 o más (Ubuntu 20+, Debian 10+, Fedora 36+, RHEL 8+). Sirve para procesadores x64 y ARM64.",
        "La CLI se instala aparte, con un script. En macOS y Linux queda en `~/.local/bin/agy`, así que esa carpeta tiene que estar en tu `PATH`. Si ya usabas Gemini CLI, `agy` lo detecta y te ofrece **migrar tu configuración** la primera vez.",
      ],
      lista: [
        "macOS: abrí `Antigravity.dmg` y arrastrá la app a Aplicaciones. Al actualizar, elegí Reemplazar.",
        "Windows: corré el instalador `.exe` y seguí el asistente.",
        "Linux: descomprimí `Antigravity.tar.gz` y abrí `./Antigravity`.",
        "CLI: corré el script de tu sistema y comprobá con `agy --version`.",
      ],
      codigo: [
        code`
# Linux: la app
tar -xzf Antigravity.tar.gz
./Antigravity

# macOS / Linux: la CLI
curl -fsSL https://antigravity.google/cli/install.sh | bash

# Windows (PowerShell): la CLI
irm https://antigravity.google/cli/install.ps1 | iex

agy --version`,
      ],
    },
    {
      heading: "Tu primera sesión paso a paso",
      parrafos: [
        "En la app, al abrirla iniciás sesión con tu cuenta de Google en el navegador y elegís un rol (Software Engineering, Knowledge Work, Data & Analytics…). El rol solo cambia **cómo se acomoda la pantalla**; si lo salteás, queda Software Engineering.",
        "En la CLI, la primera vez elegís un esquema de colores, el modo de dibujo (Alt-Screen ocupa toda la terminal, Inline escribe debajo de lo que ya había) y confirmás si **confiás en la carpeta**. Si estás por SSH, te muestra una URL: iniciás sesión en tu compu y pegás el código en la terminal remota.",
      ],
      lista: [
        "Abrí la app y creá un proyecto nuevo con la carpeta de tu repo.",
        "Elegí el modo `Local` para algo chico o `New worktree` para una tarea grande.",
        "Escribí un pedido concreto: qué querés, qué no tiene que tocar y cómo verificarlo.",
        "Mirá el plan de implementación que arma y comentalo si algo no te cierra.",
        "Revisá el diff y el informe de verificación antes de aceptar los cambios.",
      ],
      codigo: [
        code`
mkdir prueba-agy && cd prueba-agy
agy
# > crea un script que cuente las lineas de cada .py de esta carpeta
#   y corre el script para mostrarme que anda`,
      ],
    },
    {
      heading: "Comandos esenciales",
      parrafos: [
        "En la terminal, `agy` abre la sesión interactiva y `agy -p` responde una sola vez y sale. Dentro de la sesión, lo que empieza con `/` es una orden para la CLI; `?` muestra la ayuda, `@` sugiere archivos y `!` corre un comando de terminal directo.",
        "`Shift+Tab` cambia de modo sin salir de la sesión, y `Ctrl+R` abre la **revisión de artefactos**. En la app, `Cmd+,` abre la configuración y la sección Shortcuts muestra (y deja cambiar) todos los atajos.",
      ],
      codigo: [
        code`
agy                        # sesion interactiva
agy -i "explicame el repo" # arranca con un pedido
agy -p "que hace main.py"  # una sola respuesta
agy -c                     # retoma la ultima conversacion
agy models                 # modelos disponibles

/plan arreglar el login    # que planifique antes de editar
/diff                      # ver los cambios
/rewind                    # deshacer el ultimo paso
/resume                    # retomar otra conversacion
/usage                     # cuota que te queda
/exit`,
      ],
    },
    {
      heading: "Configuración",
      parrafos: [
        "La CLI guarda todo en `~/.gemini/antigravity-cli/settings.json`; `/config` lo abre como una pantalla de opciones. Las claves que más vas a tocar son `agentMode` (el modo; la cadena vacía `\"\"` es el modo default), `model`, `colorScheme`, `toolPermission` y `permissions`.",
        "En la app, la configuración tiene dos niveles: **global** (permisos, apariencia, navegador, uso de modelos, MCP y skills) y **por proyecto** (carpetas, preset de permisos y sandbox). Un proyecto nuevo hereda lo global hasta que le cambies algo.",
        "Los servidores MCP van en archivos aparte: `~/.gemini/config/mcp_config.json` para todos los proyectos y `.agents/mcp_config.json` para uno. Las herramientas MCP sin regla **te piden permiso** cada vez.",
      ],
      codigo: [
        { lang: "formats", text: code`
// ~/.gemini/antigravity-cli/settings.json
{
  "agentMode": "",
  "model": "Gemini 4 Hydrogen",
  "toolPermission": "request-review",
  "permissions": {
    "allow": ["command(git status)", "command(regex:npm run (build|lint|test))"],
    "deny": ["command(sudo)", "write_file(.git/)"]
  }
}` },
        { lang: "formats", text: code`
// .agents/mcp_config.json
{
  "mcpServers": {
    "docs-locales": { "command": "node", "args": ["servidor.js"] },
    "remoto": { "serverUrl": "https://api.ejemplo.com/mcp/" }
  }
}` },
      ],
    },
    {
      heading: "Reglas del proyecto y skills",
      parrafos: [
        "Antigravity busca `AGENTS.md` o `GEMINI.md` en tu carpeta y en cada carpeta de arriba hasta la raíz del repo, y también en `.agents/`. Las reglas globales van en `~/.gemini/AGENTS.md` o `~/.gemini/GEMINI.md`. **Suma todo lo que encuentra**, no elige uno.",
        "Si una regla no tiene que estar siempre, ponela en `.agents/rules/` con un `trigger`: `always_on`, `model_decision` (el agente la lee cuando el tema coincide con la descripción), `glob` (cuando toca ciertos archivos) o `manual`. Una regla sin `trigger` válido **se descarta sin avisar**.",
        "Los workflows (pasos guardados que llamabas con `/`) quedaron obsoletos: ahora se usan **skills**, una carpeta con un `SKILL.md` en `.agents/skills/`. Se llaman igual, con `/nombre`, y el agente también las usa solo cuando la descripción encaja.",
      ],
      codigo: [
        code`
# .agents/rules/estilo.md
---
trigger: glob
globs: "src/**/*.ts"
description: Estilo del codigo TypeScript
---
- nada de any
- funciones cortas, con nombre que diga lo que hacen`,
      ],
    },
    {
      heading: "Modelos que puede usar",
      parrafos: [
        "Antigravity usa sobre todo modelos de Google, más algunos de **otros proveedores** (Claude, de Anthropic) según tu plan. En la app se eligen debajo de la caja del prompt; en la CLI, con `/model` o `--model`, y `--effort` cambia cuánto razona.",
        "La lista cambia seguido: los Claude 4.6 y GPT-OSS 120B **se retiran el 18 de noviembre de 2026**. Antes de fijar un modelo en un script, corré `agy models`; un nombre que no existe hace fallar la corrida en vez de usar otro.",
      ],
      tabla: {
        cabeza: ["Modelo", "Para qué", "Dónde está disponible"],
        filas: [
          ["Gemini 4 Hydrogen", "Trabajo de todos los días: funciones, refactors, depurar. Tiene un nivel de razonamiento extra.", "Todos los planes (según la página de modelos)"],
          ["Gemini 4 Argon", "Ingeniería avanzada; el que Google recomienda por defecto para lo difícil.", "Pro, Ultra, Enterprise"],
          ["Gemini 4 Carbon", "El más fuerte: razonamiento largo, arquitectura, auditorías, `/swarm`.", "Ultra, Enterprise"],
          ["Orchestrator (Argon o Carbon)", "Combina Hydrogen con un modelo más fuerte dentro de la misma tarea.", "Argon: Pro y Ultra · Carbon: Ultra"],
          ["Gemini 3.8 Flash", "Rápido y liviano.", "Todos los planes"],
          ["Claude Sonnet 5.5 / Opus 5.5 (Thinking)", "Modelos de Anthropic dentro de Antigravity.", "Pro pago (sin prueba), Ultra, Enterprise"],
        ],
      },
    },
    {
      heading: "Cómo se ve en la terminal",
      parrafos: [
        "Al abrir `agy`, arriba aparece el nombre y la versión, tu cuenta con el plan, el modelo con su nivel de razonamiento y la carpeta. Cada paso del agente se muestra en una línea corta (cuánto pensó, qué está haciendo, qué herramienta usó) que se despliega con `Ctrl+O`.",
        "Abajo queda la **caja del prompt** con `>` y la pista `? for shortcuts`, y al costado el modelo activo. Por defecto el esquema de colores es `terminal`: **hereda los colores de tu terminal**, así que puede verse distinto en cada compu.",
      ],
      captura: {
        tipo: "terminal",
        titulo: "agy — ~/projects/checkout-service",
        lineas: [
          [{ t: "Antigravity CLI", c: "fuerte" }, { t: " 1.2.14", c: "tenue" }],
          [{ t: "developer@example.com (Google AI Pro)", c: "tenue" }, { t: " · ", c: "tenue" }, { t: "Gemini 4 Hydrogen (High)", c: "acento" }],
          [{ t: "~/projects/checkout-service", c: "tenue" }],
          [],
          [{ t: "> ", c: "acento" }, { t: "Run the test suite and fix the failing discount rounding test", c: "fuerte" }],
          [],
          [{ t: "  Thought for 2s, 114 tokens", c: "tenue" }],
          [{ t: "  Running unit tests to reproduce the rounding failure" }],
          [{ t: "  Bash", c: "acento" }, { t: "(npm test -- src/discounts.test.ts)" }, { t: " (ctrl+o to expand)", c: "tenue" }],
          [],
          [{ t: "  Thought for 3s, 142 tokens", c: "tenue" }],
          [{ t: "  Updating currency rounding in calculateDiscount" }],
          [{ t: "  Edit", c: "acento" }, { t: "(src/pricing/discounts.ts)" }, { t: " (ctrl+o to expand)", c: "tenue" }],
          [],
          [{ t: "> ", c: "acento" }],
          [{ t: "  ? for shortcuts", c: "tenue" }, { t: "                              Gemini 4 Hydrogen · high", c: "tenue" }],
        ],
        pie: "Una sesión de la CLI arreglando un test. Recreación de la pantalla de Antigravity CLI 1.2.14 según la maqueta de la documentación oficial (los colores son aproximados), no es una captura.",
      },
    },
    {
      heading: "Cómo se ve la app",
      parrafos: [
        "La app tiene una **barra lateral** a la izquierda (conversación nueva, historial, tareas programadas y los proyectos con sus conversaciones), la conversación en el centro con la caja \"Ask anything\" y el selector de modelo, y a la derecha los paneles de trabajo: las terminales, los **artefactos** y un navegador con la vista previa de tu app.",
        "Ya no hay un editor de código adentro: eso quedó en el Antigravity IDE y en las extensiones para otros editores. La idea es que mires el plan, el diff y la prueba en el navegador, y abras tu editor solo cuando quieras tocar algo a mano.",
      ],
      captura: {
        tipo: "app",
        titulo: "Antigravity",
        paneles: [
          {
            nombre: "Barra lateral",
            ancho: 1,
            lineas: [
              [{ t: "+ New Conversation", c: "fuerte" }],
              [{ t: "Conversation History", c: "tenue" }],
              [{ t: "Scheduled Tasks", c: "tenue" }],
              [],
              [{ t: "Projects", c: "tenue" }],
              [{ t: "checkout-service", c: "fuerte" }],
              [{ t: " Discount Code Valid…", c: "sel" }],
              [{ t: " Stripe Webhook Han…", c: "tenue" }],
              [{ t: "inventory-api", c: "fuerte" }],
              [{ t: "web-storefront", c: "fuerte" }],
              [],
              [{ t: "Settings", c: "tenue" }],
            ],
          },
          {
            nombre: "Conversación",
            ancho: 2,
            lineas: [
              [{ t: "checkout-service / Discount Code Validation", c: "tenue" }],
              [],
              [{ t: "Add promo code validation and expired", c: "fuerte" }],
              [{ t: "coupon checks to the checkout endpoint.", c: "fuerte" }],
              [],
              [{ t: "Worked for 11s", c: "tenue" }],
              [{ t: "I updated checkout-service to validate" }],
              [{ t: "discount codes before creating a payment" }],
              [{ t: "intent…" }],
              [{ t: "Shall I run the checkout test suite?" }],
              [],
              [{ t: "Ask anything, @ to mention, / for actions", c: "tenue" }],
              [{ t: "Gemini 4 Hydrogen  High", c: "acento" }],
            ],
          },
          {
            nombre: "Terminal y artefactos",
            ancho: 2,
            lineas: [
              [{ t: "Terminals", c: "fuerte" }],
              [{ t: "% npm test", c: "tenue" }],
              [{ t: "PASS src/discounts.test.ts (14 tests)", c: "ok" }],
              [{ t: "✓ rejects expired promo codes (9ms)", c: "ok" }],
              [],
              [{ t: "Artifacts (2 files)", c: "fuerte" }],
              [{ t: "Implementation Plan", c: "acento" }],
              [{ t: "Verification Report", c: "acento" }],
              [{ t: "Proposed Changes", c: "acento" }],
              [{ t: "+ if (promo.isExpired())", c: "ok" }],
              [{ t: "+   return res.status(400);", c: "ok" }],
            ],
          },
          {
            nombre: "Navegador",
            ancho: 1.5,
            lineas: [
              [{ t: "localhost:3000/checkout/preview", c: "tenue" }],
              [],
              [{ t: "Checkout API · Order Summary", c: "fuerte" }],
              [{ t: "Status       200 OK", c: "ok" }],
              [{ t: "Promo Code   SPRING20" }],
              [{ t: "Order Total  $96.00" }],
            ],
          },
        ],
        pie: "La app con un proyecto abierto: conversación, terminal, artefactos y vista previa en el navegador. Recreación de la pantalla de la app Antigravity 2.x según la maqueta de la documentación oficial, no es una captura.",
      },
    },
    {
      heading: "Seguridad y buenas prácticas",
      parrafos: [
        "En la app, el **preset de permisos** decide cuánto hace solo el agente: Request Review pregunta todo; Default corre comandos dentro del sandbox (sin red, solo el workspace y carpetas temporales) y te pregunta para lo de afuera; Auto evalúa solo lo de afuera; Turbo saca el sandbox y no frena nada. En la CLI pasa lo mismo con los modos `default`, `accept-edits` y `auto`.",
        "Las reglas `allow`, `ask` y `deny` afinan eso, y **deny siempre gana**. Ojo con los prefijos: `command(git)` aprueba cualquier `git`, incluido `git push`. El navegador tiene su regla aparte (`execute_url`), y lo que lee en una página **es dato, no una orden**.",
      ],
      lista: [
        "Turbo y `--dangerously-skip-permissions` solo en un contenedor o una máquina descartable.",
        "No subas a git un `mcp_config.json` con tokens: quedan en texto plano.",
        "Para tareas grandes usá `New worktree` o una rama.",
        "Revisá el plan y el diff aunque el informe diga que los tests pasan.",
        "No uses tu sesión de Antigravity en herramientas de terceros: va contra los términos.",
      ],
    },
    {
      heading: "Errores comunes",
      parrafos: [
        "Casi todos los tropiezos vienen de **suponer que algo se cargó** cuando en realidad se ignoró, o de dar permisos demasiado amplios para no tener que aprobar.",
      ],
      tabla: {
        cabeza: ["Error", "Qué pasa", "Cómo se arregla"],
        filas: [
          ["Regla en `.agents/rules/` sin `trigger`", "Se descarta sin avisar.", "Agregale el encabezado con un `trigger` válido."],
          ["Regla en una subcarpeta de `rules/`", "No se lee: solo cuentan los `.md` de primer nivel.", "Movela arriba o registrala en `.agents/rules.json`."],
          ["Solo exportar `GEMINI_API_KEY`", "No tiene efecto.", "Poné también `\"modelProvider\": \"gemini\"` en `settings.json`."],
          ["`agy -p` en CI sin sesión guardada", "Falla con `authentication required`.", "Iniciá sesión una vez con `agy` o usá una API key."],
          ["`agy -p` sin reglas preaprobadas", "Lo que pide permiso se rechaza y la corrida igual sale con 0.", "Preaprobá comandos concretos en `permissions.allow`."],
          ["MCP remoto con `url` o `httpUrl`", "No conecta.", "Usá `serverUrl` con transporte Streamable HTTP."],
          ["`command(*)` en allow", "Aprueba cualquier comando.", "Allow concretos y deny explícitos para lo peligroso."],
        ],
      },
    },
    {
      heading: "Comparación con Claude Code y Codex",
      parrafos: [
        "Los tres hacen el mismo bucle de leer, actuar y verificar, y los tres hablan **MCP**. La diferencia más visible es dónde viven: Antigravity apuesta por una **app gráfica** con navegador y artefactos, mientras que Claude Code y Codex nacieron en la terminal (y después sumaron editor, web y app).",
      ],
      tabla: {
        cabeza: ["", "Antigravity", "Claude Code", "Codex"],
        filas: [
          ["Empresa y cuenta", "Google (cuenta de Google, AI Pro/Ultra)", "Anthropic (plan de Claude o API)", "OpenAI (cuenta de ChatGPT o API)"],
          ["CLI", "`agy`", "`claude`", "`codex`"],
          ["Una sola vez", "`agy -p`", "`claude -p`", "`codex exec`"],
          ["Reglas del proyecto", "`AGENTS.md` o `GEMINI.md`, más `.agents/rules/`", "`CLAUDE.md`", "`AGENTS.md`"],
          ["Permisos", "Presets (Request Review, Default, Auto, Turbo) y reglas allow/ask/deny", "Modos de permisos y reglas", "Sandbox y aprobación por separado"],
          ["Modelos", "Gemini y algunos Claude", "Claude", "GPT"],
          ["Lo distintivo", "Navegador integrado, artefactos, worktree por conversación", "Hooks, skills y subagentes desde la terminal", "Codex Cloud conectado a GitHub"],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Probá con un repo de práctica: escribí un `AGENTS.md` corto, pedile una tarea chica con `New worktree` y revisá el plan, el diff y el informe antes de aceptar. Después probá lo mismo con `agy` en la terminal para ver qué cambia.",
        "La documentación oficial está ordenada por superficie (app, CLI, IDE, SDK) y tiene un **changelog** que conviene mirar seguido, porque los modelos y los comandos cambian casi cada semana. Cuando tengas la base, mirá las páginas de subagentes, hooks y el SDK.",
      ],
    },
  ],
  fuentes: [
    { texto: "Antigravity: visión general", url: "https://antigravity.google/docs/overview/" },
    { texto: "Primeros pasos e instalación", url: "https://antigravity.google/docs/getting-started" },
    { texto: "Autenticación", url: "https://antigravity.google/docs/install/" },
    { texto: "Modelos", url: "https://antigravity.google/docs/models/" },
    { texto: "Referencia de la CLI", url: "https://antigravity.google/docs/cli/reference/" },
    { texto: "Modo sin interfaz (headless)", url: "https://antigravity.google/docs/cli/headless/" },
    { texto: "Permisos", url: "https://antigravity.google/docs/permissions/" },
    { texto: "Reglas", url: "https://antigravity.google/docs/rules/" },
    { texto: "De workflows a skills", url: "https://antigravity.google/docs/migration/workflows-to-skills/" },
    { texto: "MCP", url: "https://antigravity.google/docs/mcp/" },
    { texto: "Artefactos", url: "https://antigravity.google/docs/artifacts/" },
    { texto: "Proyectos", url: "https://antigravity.google/docs/projects/" },
    { texto: "Anuncio original (noviembre 2025)", url: "https://antigravity.google/blog/introducing-google-antigravity" },
    { texto: "Antigravity 2.0", url: "https://antigravity.google/blog/introducing-google-antigravity-2" },
    { texto: "Changelog", url: "https://antigravity.google/docs/changelog/" },
  ],
  revisada: "2026-11-14",
};
