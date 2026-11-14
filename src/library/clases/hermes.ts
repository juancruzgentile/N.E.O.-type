import { type Clase, code } from "../types";

export const claseHermes: Clase = {
  titulo: "Hermes Agent de cero: el agente que aprende con el uso",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es Hermes Agent, cómo funciona por dentro, cómo se instala y se usa, " +
    "cómo guarda **memoria** y crea **skills**, qué modelos puede usar, cómo cuidarte al usarlo y en qué se diferencia de Claude Code y Codex.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Hermes Agent es un **agente de IA de código abierto** (licencia MIT) hecho por Nous Research. Igual que Claude Code o Codex, es un programa que rodea a un modelo de lenguaje con herramientas: puede leer y escribir archivos, correr comandos, buscar en la web y usar servidores MCP. Se usa desde la terminal con `hermes`, desde una app de escritorio o desde chats como Telegram o Discord.",
        "Lo que lo distingue es para qué está pensado: un asistente que **mejora cuanto más lo usás**. Recuerda datos tuyos y de tu entorno entre sesiones, busca en conversaciones viejas y, cuando resuelve algo complicado, guarda el procedimiento como una **skill** para la próxima vez. El problema que ataca es el de los agentes que empiezan cada sesión de cero y te obligan a repetir lo mismo.",
        "Otra diferencia práctica: no está atado a una empresa de modelos. Funciona con la suscripción de Nous (Nous Portal), con OpenRouter, Anthropic, OpenAI, Google y muchos más, o con un **modelo local** en tu propia máquina.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Nous Research es un laboratorio de IA conocido por la familia de modelos abiertos **Hermes** (la versión actual es Hermes 4). El agente toma el nombre de esa familia, pero son cosas distintas: Hermes Agent es el programa, y puede usar modelos de cualquier proveedor.",
        "El repositorio público `NousResearch/hermes-agent` se creó en GitHub en julio de 2025. Durante 2026 sacó versiones con fecha (como `v2026.9.24`) y después pasó a numerar con versiones semánticas: la estable al 14 de noviembre de 2026 es la `v0.23.1`, con una versión de prueba (canary) diaria aparte.",
      ],
      lista: [
        "Hoy incluye la CLI clásica, una TUI más nueva, Hermes Desktop (la app de escritorio), un panel web, el gateway de mensajería y tareas programadas (cron).",
        "Hoy el sitio oficial de la documentación es `hermes-agent.nousresearch.com`, y la propia documentación avisa que hay sitios falsos que se hacen pasar por Hermes.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      diagrama: "bucle",
      parrafos: [
        "El corazón es el mismo **bucle de agente** que en cualquier asistente de código: Hermes arma un prompt con tus instrucciones, el contexto del proyecto y la memoria; el modelo decide una acción (leer un archivo, correr un comando, buscar en la web); Hermes la ejecuta y el resultado vuelve al contexto para decidir el siguiente paso. Se repite hasta que la tarea termina o hace falta que intervengas.",
        "Las herramientas vienen en grupos llamados **toolsets** (`terminal`, `file`, `web`, `browser`, `memory`, `skills`, `cronjob`, `delegation`…) que activás o apagás con `hermes tools`. Los comandos de la herramienta `terminal` corren en un backend: tu máquina (`local`), un contenedor (`docker`), otro servidor (`ssh`) o un sandbox en la nube.",
        "Sobre ese bucle, Hermes agrega su **ciclo de aprendizaje**: al empezar cada sesión carga `MEMORY.md` y `USER.md`; durante el trabajo puede guardar datos nuevos con la herramienta `memory` y procedimientos con `skill_manage`; y con `session_search` recupera lo que pasó en sesiones anteriores. En la versión actual, la CLI no corre el agente adentro de tu terminal: se conecta a un proceso aparte, el **gateway**, que es el mismo que usan la app de escritorio y los chats. Por eso una misma sesión se puede abrir desde varios lugares.",
      ],
    },
    {
      heading: "Instalación paso a paso",
      parrafos: [
        "Elegí según tu sistema. El script instala todo lo que Hermes necesita (su propio Python 3.14, Node.js, ripgrep, FFmpeg y un Chromium para navegar) sin tocar lo que ya tenés. Tus datos quedan en `~/.hermes/` (en Windows nativo, en `%LOCALAPPDATA%\\hermes\\`).",
        "Si preferís una app con ventana, en macOS (solo Apple Silicon) y Windows bajá **Hermes Desktop** desde la web oficial: trae la CLI incluida. En Linux, la app se arma desde el código con `hermes desktop`.",
      ],
      codigo: [
        code`
# 1. Linux, macOS o WSL2
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# 1. Windows nativo, en PowerShell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)

# 1. Docker (los datos quedan en ~/.hermes del host)
docker run -it --rm -v ~/.hermes:/opt/data nousresearch/hermes-agent setup

# 2. recargar la terminal para que aparezca el comando
source ~/.bashrc     # o ~/.zshrc

# 3. comprobar que todo este bien
hermes doctor`,
      ],
    },
    {
      heading: "Tu primera sesión, paso a paso",
      parrafos: [
        "La regla de la guía oficial es: **primero una charla que funcione**, después todo lo demás. No sumes gateway, cron ni skills hasta que una conversación simple ande bien.",
      ],
      lista: [
        "Corré `hermes setup`. Si tenés suscripción a Nous Portal, `hermes setup --portal` inicia sesión y deja todo listo; si no, elegí Full Setup y conectá tu proveedor con su clave.",
        "Si ya tenías configurado el proveedor, alcanza con `hermes model`: elegís proveedor, iniciás sesión o pegás la clave, y elegís modelo. La clave se guarda en `~/.hermes/.env`.",
        "Entrá a tu proyecto (`cd mi-proyecto`) y corré `hermes`, o `hermes --tui` para la interfaz nueva. El banner muestra el modelo, el backend de terminal, la carpeta, las herramientas y las skills.",
        "Pedile algo fácil de verificar: \"resumí este repositorio en 5 puntos y decime cuál es el punto de entrada\". Fijate que responda sin errores y que use alguna herramienta.",
        "Salí con `/quit` y volvé con `hermes -c`: si retoma la conversación, las sesiones funcionan.",
        "Si algo falla, seguí este orden: `hermes doctor`, `hermes model`, `hermes setup`.",
      ],
    },
    {
      heading: "Comandos esenciales",
      parrafos: [
        "Hay dos tipos de comandos: los de la terminal (`hermes algo`), para configurar y arrancar, y los de **barra** (`/algo`), que escribís dentro de la sesión y los resuelve Hermes sin pasar por el modelo. Cada skill instalada también se vuelve un comando de barra.",
        "Un detalle útil: una línea que empieza con `!` corre como comando de la terminal en tu máquina, sin gastar tokens ni entrar en la conversación.",
      ],
      codigo: [
        code`
# en la terminal
hermes                    # charlar (CLI clasica)
hermes --tui              # charlar (TUI)
hermes -c                 # retomar la ultima sesion
hermes model              # proveedor y modelo
hermes tools              # que herramientas puede usar
hermes skills browse      # skills para instalar
hermes sessions list      # sesiones anteriores
hermes -z "pregunta"      # responde y termina (para scripts)
hermes update             # actualizar

# dentro de la sesion
/help    /new    /model    /tools    /skills
/status  /context  /compress  /undo  /retry
/init               # crea AGENTS.md mirando el repo
/learn ...          # convierte algo en una skill
!git status         # comando directo, sin el modelo`,
      ],
    },
    {
      heading: "Memoria y skills: cómo aprende",
      parrafos: [
        "La **memoria** son dos archivos chicos en `~/.hermes/memories/`: `MEMORY.md` (notas del agente sobre tu entorno y lo que aprendió, unos 2200 caracteres) y `USER.md` (tu perfil y preferencias, unos 1375). Se cargan al empezar cada sesión como una foto fija: lo que guarde hoy lo va a ver **en la próxima sesión**, no en la actual. Por eso conviene cortar con `/new` al terminar una tarea.",
        "Ojo con un error típico: que el modelo diga \"listo, lo recuerdo\" no significa que lo haya guardado. Solo queda si llamó a la herramienta `memory`. Si dudás, abrí el archivo y fijate.",
        "Las **skills** son procedimientos más largos, cada uno en un `SKILL.md` dentro de `~/.hermes/skills/<categoría>/<nombre>/`. Hermes trae un catálogo, podés instalar más con `hermes skills install`, y el propio agente crea nuevas con `skill_manage` cuando resuelve algo de varios pasos o cuando lo corregís. Para no llenar el contexto, al principio solo ve el nombre y la descripción de cada skill, y lee la completa cuando la necesita.",
      ],
      codigo: [
        { lang: "formats", text: code`
---
name: deploy-staging
description: Desplegar el servidor de staging
version: 1.0.0
---
# Desplegar staging

## When to Use
Cuando hay que subir la rama main a staging.

## Procedure
1. Correr los tests
2. Construir la imagen
3. Desplegar y revisar el healthcheck

## Pitfalls
- Si falla el healthcheck, revisar las variables de entorno

## Verification
La URL de staging responde 200.` },
      ],
    },
    {
      heading: "Configuración",
      parrafos: [
        "Todo vive en `~/.hermes/`. La regla es simple: las **claves y tokens** van en `.env`, todo lo demás en `config.yaml`. El comando `hermes config set` elige el archivo solo: los nombres en mayúsculas como `OPENROUTER_API_KEY` van a `.env`, y los que llevan puntos como `terminal.backend` van a `config.yaml`. Las opciones que pasás al arrancar le ganan a los dos.",
        "Las instrucciones del proyecto van aparte, en un archivo de contexto. Hermes carga **uno solo por sesión**, el primero que encuentra: `.hermes.md`, `AGENTS.override.md`, `AGENTS.md`, `CLAUDE.md` o `.cursorrules`. Y siempre suma `~/.hermes/SOUL.md`, donde se define su personalidad.",
      ],
      codigo: [
        code`
~/.hermes/
├── config.yaml   # configuracion (modelo, terminal, aprobaciones...)
├── .env          # claves y tokens
├── auth.json     # logins OAuth (Nous Portal, etc.)
├── SOUL.md       # personalidad del agente
├── memories/     # MEMORY.md y USER.md
├── skills/       # skills instaladas y creadas por el agente
├── cron/         # tareas programadas
└── logs/         # registros (con secretos tapados)`,
        { lang: "formats", text: code`
# ~/.hermes/config.yaml (fragmento)
terminal:
  backend: local          # local | docker | ssh | modal | daytona | vercel_sandbox
approvals:
  mode: smart             # smart | manual | off
memory:
  memory_enabled: true
  write_approval: false   # true: aprobar cada escritura de memoria
mcp_servers:
  github:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "\${GITHUB_TOKEN}"` },
      ],
    },
    {
      heading: "Modelos que puede usar",
      parrafos: [
        "Hermes no trae un modelo propio adentro: usa el del proveedor que elijas con `hermes model`. Hay un requisito duro: el modelo tiene que tener una ventana de **al menos 64.000 tokens** de contexto, si no Hermes no arranca. Los catálogos y los nombres cambian seguido, así que confirmá la lista actual con `/model`; los precios están en cada proveedor (para Nous, en `portal.nousresearch.com`).",
        "Un detalle importante sobre los modelos de la casa: la propia documentación dice que **Hermes 4 no se recomienda para el agente**. Es un modelo de charla y razonamiento, no está afinado para encadenar llamadas a herramientas. Para trabajar con el agente conviene un modelo \"agéntico\" de frontera.",
      ],
      tabla: {
        cabeza: ["Modelo", "Para qué", "Dónde está disponible"],
        filas: [
          ["Claude (Anthropic)", "trabajo general del agente y código", "Nous Portal, API de Anthropic, OpenRouter, AWS Bedrock"],
          ["GPT y Codex (OpenAI)", "razonamiento y uso de herramientas", "Nous Portal, API de OpenAI, tu suscripción de ChatGPT (`openai-codex`)"],
          ["Gemini (Google)", "contextos muy largos", "Nous Portal, Google AI Studio"],
          ["DeepSeek, Qwen, Kimi, GLM, MiniMax", "modelos abiertos o más baratos para programar", "Nous Portal, OpenRouter o la API de cada empresa"],
          ["Hermes 4 (Nous Research)", "charla, investigación y escritura; **no para el agente**", "Nous Portal"],
          ["Modelos locales", "privacidad y trabajo sin internet", "Ollama, llama.cpp, LM Studio, vLLM (con contexto de 64K o más)"],
        ],
      },
    },
    {
      heading: "Cómo se ve",
      parrafos: [
        "Al abrir `hermes` aparece un banner con el nombre en dorado y un resumen: modelo, backend de terminal, carpeta de trabajo, cantidad de herramientas y skills, e id de la sesión. Abajo queda fija la caja donde escribís, que empieza con `❯`.",
        "En el diseño de fábrica (`modern`), cada paso del agente es una fila que empieza con un símbolo: lo que leyó, el parche con su diff, un comando que falló en rojo con su código de salida, y la respuesta después de `☤ Hermes`. Debajo de la caja hay una **línea de estado** con el modelo, cuánto contexto usaste y la carpeta con su rama de git. Si activás YOLO, aparece un aviso rojo para que no te olvides.",
      ],
      captura: {
        tipo: "terminal",
        titulo: "hermes — ~/project",
        lineas: [
          [{ t: "  ☤ HERMES AGENT", c: "acento" }, { t: "   (banner del caduceo)", c: "tenue" }],
          [{ t: "  Model: ", c: "tenue" }, { t: "anthropic/claude-sonnet-4", c: "fuerte" }],
          [{ t: "  Terminal: ", c: "tenue" }, { t: "local" }, { t: "   Working dir: ", c: "tenue" }, { t: "/home/user/project" }],
          [{ t: "  Tools: ", c: "tenue" }, { t: "19" }, { t: "   Skills: ", c: "tenue" }, { t: "12" }, { t: "   Session: ", c: "tenue" }, { t: "20260315_123456_abcd1234" }],
          [],
          [{ t: "❯ ", c: "acento" }, { t: "add a multiply function and run the tests", c: "fuerte" }],
          [{ t: "∴ Thought for 3s · Planning the change", c: "tenue" }],
          [{ t: "📖 Read calc.py" }],
          [{ t: "🔧 Patch  0.2s" }],
          [{ t: "│ ", c: "tenue" }, { t: "+def multiply(a, b):", c: "ok" }],
          [{ t: "│ ", c: "tenue" }, { t: "+    return a * b", c: "ok" }],
          [{ t: "✗ $ pytest -q  0.4s [exit 1]", c: "error" }],
          [{ t: "☤ Hermes", c: "acento" }],
          [{ t: "Added multiply; pytest isn't installed here, so I ran the tests" }],
          [{ t: "directly: 2 passed." }],
          [{ t: "─ 15.0s · edited 1 file +4 -0 · read 2 files · 8:27 AM", c: "tenue" }],
          [{ t: "──────────────────────────────────────────────────────────────────────────", c: "tenue" }],
          [{ t: "❯ ", c: "acento" }],
          [{ t: "──────────────────────────────────────────────────────────────────────────", c: "tenue" }],
          [{ t: " claude-sonnet-4 · ctx [░░░░░░░░] 4% · ~/project (main)", c: "tenue" }, { t: "   ctrl+c stop", c: "tenue" }],
        ],
        pie: "La CLI clásica de Hermes Agent con el diseño modern: banner, una tarea terminada y la línea de estado. Junta las dos figuras de la documentación oficial (el banner y el diseño modern). Recreación de la pantalla de Hermes Agent v0.23.1, no es una captura.",
      },
    },
    {
      heading: "Cómo se ve la app",
      parrafos: [
        "Hermes Desktop usa el mismo agente, la misma configuración, las mismas sesiones, memoria y skills que la terminal: lo que hacés en un lado aparece en el otro. La ventana se organiza con una **barra lateral** a la izquierda para navegar, el **chat** en el centro con la actividad de las herramientas en vivo, y un riel a la derecha con la vista previa, el explorador de archivos, una terminal real y el panel de revisión de Git (`Cmd/Ctrl+G`).",
        "Abajo del chat hay una barra de estado con un interruptor de YOLO por sesión y un medidor de cuánto contexto usaste. También hay un modo Simple, más limpio, que esconde la terminal, los diffs y los detalles técnicos.",
      ],
      captura: {
        tipo: "app",
        titulo: "Hermes",
        paneles: [
          {
            nombre: "Barra lateral",
            ancho: 1,
            lineas: [
              [{ t: "Sesiones", c: "tenue" }],
              [{ t: "Add multiply to calc.py", c: "sel" }],
              [{ t: "refactor auth" }],
              [{ t: "deploy staging" }],
              [],
              [{ t: "Artifacts", c: "tenue" }],
              [{ t: "Scheduled jobs", c: "tenue" }],
              [{ t: "Capabilities", c: "tenue" }],
              [{ t: "Messaging", c: "tenue" }],
              [{ t: "Settings", c: "tenue" }],
            ],
          },
          {
            nombre: "Chat",
            ancho: 2.2,
            lineas: [
              [{ t: "add a multiply function and run the tests", c: "fuerte" }],
              [],
              [{ t: "▸ Read calc.py", c: "tenue" }],
              [{ t: "▸ Patch calc.py  +4 -0", c: "tenue" }],
              [{ t: "▸ $ pytest -q  exit 1", c: "error" }],
              [],
              [{ t: "Added multiply and ran the tests: 2 passed." }],
              [],
              [{ t: "┌──────────────────────────────────────┐", c: "tenue" }],
              [{ t: "│                                      │", c: "tenue" }],
              [{ t: "└──────────────────────────────────────┘", c: "tenue" }],
              [{ t: "YOLO", c: "tenue" }, { t: "  ·  contexto 4%", c: "tenue" }],
            ],
          },
          {
            nombre: "Riel derecho",
            ancho: 1.3,
            lineas: [
              [{ t: "Preview  Files  Review", c: "tenue" }],
              [],
              [{ t: "▾ project/", c: "acento" }],
              [{ t: "   calc.py", c: "sel" }],
              [{ t: "   test_calc.py" }],
              [{ t: "   AGENTS.md" }],
              [],
              [{ t: "Terminal", c: "tenue" }],
              [{ t: "$ git status", c: "fuerte" }],
              [{ t: " M calc.py", c: "ok" }],
            ],
          },
        ],
        pie: "Hermes Desktop en modo Advanced: barra lateral, chat con la actividad de las herramientas y el riel derecho con archivos y terminal. Armada a partir de la descripción de la documentación oficial, los textos de ejemplo son ilustrativos. Recreación de la pantalla de Hermes Desktop v0.23.1, no es una captura.",
      },
    },
    {
      heading: "Seguridad y buenas prácticas",
      parrafos: [
        "Con el backend `local`, el que viene de fábrica, **no hay aislamiento**: Hermes corre los comandos en tu máquina con tu usuario. Lo que tiene es un control de **comandos peligrosos** (`rm -r`, `curl | sh`, `chmod 777`, `DROP TABLE`…): en modo `smart` un modelo auxiliar evalúa el riesgo y te pregunta lo dudoso; en `manual` te pregunta siempre. Por debajo hay una lista dura (borrar `/`, formatear un disco, una fork bomb) que no se ejecuta ni con YOLO.",
        "Para aislar de verdad, cambiá `terminal.backend` a `docker` o `ssh`. Ojo con lo que eso implica: dentro de un contenedor **Hermes deja de revisar los comandos**, porque el límite es el contenedor. Por eso no le pases secretos con `docker_forward_env` si no hacen falta.",
      ],
      lista: [
        "Claves solo en `~/.hermes/.env`, con `chmod 600`. Nunca en el chat ni en un repositorio.",
        "YOLO (`--yolo`, `/yolo`, `approvals.mode: off`) solo en algo descartable.",
        "Revisá `AGENTS.md`, skills y servidores MCP de proyectos ajenos: Hermes escanea en busca de prompt injection, pero el escaneo es heurístico. Las skills de un repo clonado no se cargan hasta `hermes skills trust`.",
        "Un servidor MCP local solo recibe las variables que declarás en su `env`; dale credenciales de solo lectura cuando se pueda.",
        "En el gateway: listas de usuarios permitidos o códigos de emparejamiento, nunca `GATEWAY_ALLOW_ALL_USERS=true`, nunca como root.",
        "Para cambios grandes, `--checkpoints` guarda una copia y `/rollback` la restaura. Igual hacé un commit antes.",
        "Instalá solo desde `hermes-agent.nousresearch.com` o `github.com/NousResearch`.",
      ],
    },
    {
      heading: "Errores comunes",
      parrafos: [
        "Casi todos los problemas de los primeros días vienen de la configuración, no del agente. La guía oficial junta estos:",
      ],
      lista: [
        "`hermes: command not found`: no recargaste la terminal. Corré `source ~/.bashrc` (o abrí otra).",
        "Respuestas vacías o rotas: el proveedor o el modelo están mal configurados. Corré `hermes model` de nuevo.",
        "\"Me dijo que lo recordaba y en la sesión siguiente no sabía\": no llamó a la herramienta `memory`, o estás en otro perfil, o lo guardó en esta sesión y todavía no abriste una nueva. Mirá `~/.hermes/memories/MEMORY.md`.",
        "Un modelo local que no usa bien las herramientas: los modelos chicos suelen fingir que llamaron a una herramienta. Probá uno más grande o subí el contexto a 64K (en Ollama arranca en 2048).",
        "Cambiar de modelo en medio de una charla larga: el siguiente mensaje **se cobra entero** porque se pierde la caché. Cambiá al principio o después de `/new`.",
        "El gateway arranca pero nadie le puede escribir: faltan el token del bot o la lista de usuarios. Revisá con `hermes gateway status`.",
        "Una tarea de cron que nunca corre: las ejecuta el gateway, que tiene que estar prendido.",
      ],
    },
    {
      heading: "Comparación con Claude Code y Codex",
      parrafos: [
        "Los tres son agentes con el mismo bucle de leer, actuar y verificar, y los tres usan MCP y skills. Las diferencias están en para qué fueron pensados, quién pone el modelo y cómo te protegen. Claude Code y Codex están centrados en programar en tu repositorio con los modelos de su empresa; Hermes apunta a un **asistente que vive en un servidor**, te habla por chat, corre tareas programadas y acumula lo que aprende, con el modelo que elijas.",
      ],
      tabla: {
        cabeza: ["", "Hermes Agent", "Claude Code", "Codex"],
        filas: [
          ["Quién lo hace", "Nous Research, código abierto (MIT)", "Anthropic", "OpenAI"],
          ["Modelos", "casi cualquier proveedor, o uno local", "modelos Claude", "modelos de OpenAI"],
          ["Instrucciones del proyecto", "`.hermes.md`, `AGENTS.md` o `CLAUDE.md` (uno solo)", "`CLAUDE.md`", "`AGENTS.md`"],
          ["Foco del diseño", "aprender con el uso: memoria (`MEMORY.md`, `USER.md`) y búsqueda en sesiones viejas", "programar en tu repositorio", "programar en tu repositorio y en la nube"],
          ["Skills", "las **crea y mejora solo**, más un hub", "skills que escribís o instalás", "skills según la superficie"],
          ["Protección", "aprobación de comandos peligrosos + backend (local, docker, ssh, nube)", "modos de permisos", "sandbox y aprobación por separado"],
          ["Dónde se usa", "terminal, Desktop, web, Telegram, Discord, Slack…", "terminal, IDE, app", "terminal, IDE, app, nube"],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Con lo de esta clase ya podés usarlo todos los días. El siguiente paso, en orden: escribí un `AGENTS.md` corto para tu proyecto, mirá qué skills trae con `hermes skills browse`, y **revisá de vez en cuando** qué guardó en `~/.hermes/memories` y `~/.hermes/skills`. Recién cuando todo eso ande, sumá el gateway o una tarea programada, y para eso pasá el backend a `docker`.",
        "Los comandos y los modelos cambian seguido. La fuente confiable es la documentación oficial en `hermes-agent.nousresearch.com/docs`, que tiene una guía de seguridad muy completa. Para el día a día, volvé a la pestaña Referencia de este tema.",
      ],
    },
  ],
  fuentes: [
    { texto: "Repositorio oficial de Hermes Agent", url: "https://github.com/NousResearch/hermes-agent" },
    { texto: "Instalación", url: "https://hermes-agent.nousresearch.com/docs/getting-started/installation" },
    { texto: "Quickstart", url: "https://hermes-agent.nousresearch.com/docs/getting-started/quickstart" },
    { texto: "Interfaz de línea de comandos", url: "https://hermes-agent.nousresearch.com/docs/user-guide/cli" },
    { texto: "Configuración", url: "https://hermes-agent.nousresearch.com/docs/user-guide/configuration" },
    { texto: "Memoria persistente", url: "https://hermes-agent.nousresearch.com/docs/user-guide/features/memory" },
    { texto: "Sistema de skills", url: "https://hermes-agent.nousresearch.com/docs/user-guide/features/skills" },
    { texto: "Seguridad", url: "https://hermes-agent.nousresearch.com/docs/user-guide/security" },
    { texto: "Nous Portal y modelos", url: "https://hermes-agent.nousresearch.com/docs/integrations/nous-portal" },
    { texto: "Hermes Desktop", url: "https://hermes-agent.nousresearch.com/docs/user-guide/desktop" },
  ],
  revisada: "2026-11-14",
};
