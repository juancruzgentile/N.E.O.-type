import { type Topic, a, b, code, m } from "./types";
import { claseCursor } from "./clases/cursor";

export const cursor: Topic = {
  id: "cursor",
  name: "Cursor",
  group: "IA",
  emblem: null,
  badge: "CU",
  color: "#f54e00",
  hl: "linux",
  summary:
    "Cursor es un editor de código con IA hecho por Anysphere (hoy parte de SpaceX), armado sobre VS Code. Tiene autocompletado (Tab), un agente que edita y corre comandos, " +
    "una ventana de agentes, agentes en la nube, una CLI (agent) y Bugbot para revisar PRs. Acá está cómo se instala, sus modos, las reglas del proyecto (.cursor/rules, AGENTS.md), " +
    "MCP, los modelos que puede usar, la privacidad y una comparación con Claude Code y Codex.",
  alert: {
    title: "ANTES DE USAR CURSOR: SEGURIDAD",
    items: [
      "El agente edita archivos de tu proyecto sin pedirte permiso y los cambios se escriben al disco en el momento. Trabajá con git y hacé un commit o una rama antes de pedirle algo grande.",
      "El modo Run Everything (y --force o --yolo en la CLI) corre todo sin sandbox ni clasificador. Usalo solo en una máquina o contenedor descartable.",
      "Las Run Modes, según la propia documentación, son una barrera de mejor esfuerzo, no un límite de seguridad duro. Leé lo que te pide aprobar, sobre todo sudo, rm, curl o git push.",
      ".cursorignore frena al agente, pero los comandos de terminal y las herramientas MCP corren por fuera de ese control: un cat .env igual puede leer el archivo.",
      "Por defecto el agente puede leer archivos fuera del proyecto (acceso de lectura \"System\"). Si no querés eso, cambialo a workspace.",
      "Lo que el agente lee de afuera (una web, un issue, un README ajeno, la respuesta de un MCP) puede traer instrucciones escondidas (prompt injection). Para repos que no conocés, activá Workspace Trust, que viene apagado.",
      "Las claves que ponés en headers o env de mcp.json quedan en texto plano: no subas a git un .cursor/mcp.json con secretos y agregá solo servidores MCP de fuentes confiables.",
    ],
    closing: "Cursor trabaja rápido y mucho solo, y por eso conviene revisar cada diff antes de aceptarlo: vos decidís qué se ejecuta, qué se guarda y qué se publica.",
  },
  facts: [
    { label: "Ejecutar", value: "la app Cursor · agent  (CLI, en la carpeta del proyecto)" },
    { label: "Una sola vez", value: "agent -p \"pregunta\"" },
    { label: "Memoria", value: ".cursor/rules/*.mdc · AGENTS.md" },
    { label: "Modelos", value: "Composer 2.5 · Grok 4.7 · Opus 5.5 · GPT-5.6 Sol · Gemini 4" },
    { label: "Ayuda", value: "/help · cursor.com/docs" },
  ],
  workflow: [
    { title: "Empezá por las reglas", text: "Poné en AGENTS.md (o en .cursor/rules) cómo instalar, cómo testear, el estilo y qué no tocar. El agente lo lee en cada pedido y te ahorra repetirlo. Las reglas cortas y concretas rinden más que un documento largo." },
    { title: "Plan antes que código", text: "Para algo más grande que un arreglo chico, pasá a Plan con Shift+Tab: el agente investiga, te hace preguntas y arma un plan que podés editar. Si el resultado no te gusta, conviene volver atrás, afinar el plan y correrlo de nuevo antes que parchear." },
    { title: "Ask para entender, Agent para cambiar", text: "Ask es de solo lectura: sirve para recorrer código que no conocés sin riesgo. Cuando ya sabés qué querés cambiar, volvé a Agent." },
    { title: "Revisá el diff y usá los checkpoints", text: "Antes de aceptar, mirá el diff. Si algo salió mal, un checkpoint vuelve los archivos a como estaban. Los checkpoints son locales y no reemplazan a git: hacé commits igual." },
    { title: "Mandá lo largo a la nube", text: "Una tarea larga puede ir a un Cloud Agent (desde el desplegable Cloud o con & en la CLI): trabaja en una máquina aparte, en otra rama, y te deja un PR para revisar como cualquier otro." },
  ],
  entries: [
    // ── BÁSICO ──
    b("Primeros pasos", "Instalar Cursor", "La app se baja de cursor.com/download. macOS 12 o más nuevo (.dmg, Apple Silicon e Intel), Windows 10 o más nuevo (.exe, instalador de usuario o de sistema). En Linux conviene el repositorio apt o dnf, que trae ícono y actualizaciones; también hay AppImage.", code`
# macOS: abri el .dmg y arrastra Cursor a Aplicaciones
# Windows: corre el .exe (User o System, x64 o ARM64)

# Debian/Ubuntu
curl -fsSL https://downloads.cursor.com/keys/anysphere.asc | gpg --dearmor | sudo tee /etc/apt/keyrings/cursor.gpg > /dev/null
echo "deb [arch=amd64,arm64 signed-by=/etc/apt/keyrings/cursor.gpg] https://downloads.cursor.com/aptrepo stable main" | sudo tee /etc/apt/sources.list.d/cursor.list > /dev/null
sudo apt update && sudo apt install cursor

# Fedora/RHEL (con el repo de downloads.cursor.com/yumrepo)
sudo dnf install cursor

# AppImage (portable)
chmod +x Cursor-*.AppImage && ./Cursor-*.AppImage`, "instalar descargar dmg exe apt dnf appimage linux windows mac"),
    b("Primeros pasos", "Primer inicio e importar VS Code", "Al abrir Cursor iniciás sesión con tu cuenta (crearla es gratis) y abrís una carpeta. Si venías de VS Code, Cursor trae tus extensiones, temas, settings y atajos con un clic. Ojo: las extensiones salen de Open VSX, no del Marketplace de Microsoft, así que alguna puede faltar.", code`
# 1. abri Cursor e inicia sesion con tu cuenta
# 2. File > Open Folder
# 3. importar VS Code:
#    Cursor Settings (Cmd/Ctrl+Shift+J) > General > Account
#    > VS Code Import > Import`, "primer inicio login cuenta importar vscode extensiones open vsx"),
    b("Editor", "Tab: autocompletado", "Tab sugiere código mientras escribís, en gris adelante del cursor. Puede cambiar varias líneas, agregar imports y seguir en otro lugar del archivo. Se apaga o se pausa desde el indicador Tab abajo a la derecha.", code`
Tab              # acepta la sugerencia entera
Tab otra vez     # salta a la proxima edicion que predice
Cmd+Flecha der   # (Ctrl+Flecha der en Win/Linux) acepta palabra por palabra
Esc              # la descarta (o segui escribiendo)
# Cursor Settings > Tab: apagar o pausar, tambien por tipo de archivo`, "tab autocompletado sugerencia completar"),
    b("Editor", "Cmd/Ctrl+K: código al agente", "Cmd+K abría la vieja edición en línea, que fue reemplazada: hoy, con código seleccionado, Cmd+K o Cmd+L (Ctrl en Windows/Linux) abre el Agent con esas líneas ya citadas, listo para que le digas qué cambiar.", code`
# selecciona unas lineas y apreta:
Cmd+K  o  Cmd+L        # Mac: abre el Agent con la seleccion
Ctrl+K o  Ctrl+L       # Windows/Linux
Cmd+Shift+L            # agrega la seleccion al chat que ya esta abierto
# la edicion en linea vieja (Cmd+K en el editor) ya no existe`, "cmd k inline edit edicion en linea seleccion"),
    b("Agente", "Abrir el Agent y elegir modo", "El Agent vive en el panel lateral (Cmd/Ctrl+I). Shift+Tab rota entre los modos y Cmd/Ctrl+. abre el menú: Agent hace cambios, Ask solo lee y responde, Plan arma un plan antes de tocar código y Debug busca un error con logs y evidencia.", code`
Cmd+I / Ctrl+I     # abrir o cerrar el panel del Agent
Shift+Tab          # rotar modos: Agent, Plan, Ask, Debug
Cmd+. / Ctrl+.     # menu de modos
Cmd+/ / Ctrl+/     # rotar entre modelos
Enter              # encola el mensaje si el agente esta trabajando
Cmd+Enter          # lo manda ya`, "agent chat modos ask plan debug panel lateral"),
    b("Agente", "@-menciones", "Con @ agregás contexto puntual: un archivo, una carpeta, la salida de la terminal, otro chat o un diff de git. Si no sabés qué archivos importan, no hace falta: el agente busca solo.", code`
@auth.ts                       # un archivo
@src/components/               # una carpeta (con / navegas adentro)
@Terminals                     # la salida de la terminal
@Chats                         # contexto de otra conversacion
@Commit (Diff of Working State)   # cambios sin confirmar
@Branch (Diff with Main)          # todo el diff de la rama
@Browser                       # lo que muestra el navegador integrado`, "arroba mencion contexto archivos carpeta terminal diff"),
    b("Configuración", "Reglas: .cursor/rules y AGENTS.md", "Las reglas de proyecto van en .cursor/rules, cada una en un archivo .mdc (un .md ahí se ignora). También lee un AGENTS.md en la raíz, y otros anidados en subcarpetas. Hay reglas de usuario (Customize > Rules) y de equipo; si chocan, gana equipo, después proyecto, después usuario.", code`
# .cursor/rules/tests.mdc
---
description: Como escribir tests en este proyecto
globs: src/**/*.test.ts
alwaysApply: false
---
- Usa vitest, no jest
- Un archivo de test por modulo

# /create-rule en el chat crea una regla nueva`, "rules reglas mdc agents.md memoria instrucciones globs alwaysapply"),
    b("CLI", "Instalar la CLI (agent)", "La CLI se instala aparte y el comando se llama agent. Queda en ~/.local/bin, que tiene que estar en tu PATH. Se actualiza sola, o con agent update.", code`
curl https://cursor.com/install -fsS | bash          # macOS, Linux y WSL
irm 'https://cursor.com/install?win32=true' | iex   # Windows (PowerShell)

export PATH="\$HOME/.local/bin:\$PATH"   # en ~/.bashrc o ~/.zshrc
agent --version
agent update
agent login        # iniciar sesion
agent status       # con que cuenta estas`, "cli instalar agent curl powershell path login"),
    b("Modelos y planes", "Elegir modelo", "En el editor, con el selector debajo de la caja del chat o Cmd/Ctrl+/. En la CLI, con /model o --model. Auto elige solo. Muchos modelos de terceros vienen ocultos y hay que activarlos; cuáles ves depende de tu plan.", code`
agent models                  # que modelos tiene tu cuenta
agent --model NOMBRE          # elegir uno al arrancar (NOMBRE: como lo lista agent models)
/model                        # elegirlo dentro de la sesion
/model grok                   # filtrar la lista`, "modelo model elegir auto composer grok claude gpt gemini"),
    b("Modelos y planes", "Planes", "Hay Free, Plus, Premium, Super y Ultra para personas, y Teams y Enterprise para empresas. Free y Plus no traen modelos de terceros (Claude, GPT, Gemini) ni Cloud Agents; desde Premium sí, junto con Bugbot. Los planes viejos (Hobby, Pro, Pro+) siguen para quien ya los tenía.", code`
# Free:    uso limitado del Agent, sin modelos de terceros
# Plus:    modelos de Cursor (Composer, Grok), sin Auto ni Cloud Agents
# Premium: + Cloud Agents, Automations, Bugbot, modelos de terceros
# Super / Ultra: lo mismo con mucho mas uso
# Teams / Enterprise: facturacion central, SSO, controles de admin
# precios y limites exactos: cursor.com/docs/models-and-pricing`, "planes free plus premium super ultra teams enterprise precio"),
    b("Seguridad", "Privacy Mode", "Con Privacy Mode activado, tu código no se usa para entrenar modelos, ni de Cursor ni de los proveedores. Igual tus pedidos y el código del contexto viajan al proveedor del modelo para que responda. En Teams y Enterprise viene activado por defecto.", code`
# Cursor Settings (Cmd/Ctrl+Shift+J) > General > Privacy Mode
# activado: no se entrena con tu codigo
# NO evita que el pedido viaje al proveedor del modelo
# con tu propia API key no rige la retencion cero (ZDR) de Cursor`, "privacidad privacy mode entrenamiento datos zdr"),

    // ── INTERMEDIO ──
    m("CLI", "Usar la CLI", "agent abre una sesión interactiva en la terminal, con los mismos modos que el editor. Lee las reglas de .cursor/rules y también AGENTS.md y CLAUDE.md de la raíz, y usa los mismos MCP que el editor.", code`
cd mi-proyecto
agent                          # sesion interactiva
agent "explicame la estructura"
agent --plan                   # arranca en Plan
agent --mode ask               # solo lectura
agent ls                       # chats anteriores
agent resume                   # retomar el ultimo (o --continue)
agent -w arreglo-login         # trabajar en un worktree aparte`, "cli agent sesion interactiva modos resume worktree"),
    m("CLI", "Comandos de /", "Dentro de la CLI, lo que empieza con / no va al modelo: cambia el modo, el modelo o la sesión.", code`
/model        # elegir modelo
/plan         # modo Plan        /ask    # modo Ask (solo lectura)
/debug        # modo Debug
/clear        # chat nuevo (alias /new)
/resume       # retomar un chat   /fork  # bifurcar el actual
/summarize    # resumir para liberar contexto (alias /compress)
/rewind       # volver a un mensaje anterior
/sandbox      # configurar sandbox y red
/mcp list     # servidores MCP
/help         # ayuda             /quit  # salir`, "slash comandos cli model plan ask clear resume summarize"),
    m("Agente", "Plan Mode", "El agente investiga el código, te hace preguntas y escribe un plan antes de tocar nada. Podés editar el plan; cuando está bien, lo mandás a construir. Los planes se guardan en tu carpeta de usuario; con Save to workspace pasan al proyecto.", code`
# en el editor: Shift+Tab hasta Plan
# en la CLI:
agent --plan "agregar login con Google"
/plan agregar login con Google
# si el resultado no sirve: revertir, afinar el plan y volver a correrlo`, "plan mode planificar plan preguntas construir"),
    m("Agente", "Checkpoints", "Antes de cambios importantes, Cursor guarda un checkpoint con los archivos que va a tocar. Desde la línea de tiempo del chat podés previsualizarlo y restaurarlo. Vuelve los archivos, no la conversación, y es local: no reemplaza a git.", code`
# en el chat: boton "Restore Checkpoint" en un pedido anterior
# o el + al pasar el mouse sobre un mensaje
# restaura archivos, no borra mensajes
# en la CLI: /rewind vuelve a un mensaje anterior`, "checkpoint restaurar deshacer volver atras"),
    m("Agente", "Agents Window", "Desde Cursor 3 hay una ventana centrada en agentes: lista de agentes a la izquierda, varios repos y entornos (local, nube, SSH), un visor de diffs para revisar y commitear, y worktrees para que cada agente trabaje aislado. Podés ir y volver al IDE clásico cuando quieras.", code`
# Cmd/Ctrl+Shift+P > "Open Agents Window"
# Cmd/Ctrl+Shift+P > "Open IDE"   (volver al editor clasico)
# dentro: Cmd+P busca archivos, Cmd+K busca conversaciones`, "agents window ventana de agentes cursor 3 worktrees diffs"),
    m("Nube", "Cloud Agents", "Antes se llamaban Background Agents. Corren en una máquina virtual aislada en la nube, con tu repo clonado, en otra rama, y devuelven el trabajo para que lo revises. No necesitan tu compu prendida. Requieren Premium o más, Teams o Enterprise.", code`
# desde el editor: elegir "Cloud" en el desplegable bajo la caja del agente
# desde la web o el celular: cursor.com/agents
# en Slack, GitHub o Linear: mencionar @cursor
# desde la CLI: empezar el mensaje con &
& migra los tests de jest a vitest
# entorno: .cursor/environment.json (o un snapshot / Dockerfile)`, "cloud agents background nube vm remoto slack github"),
    m("MCP", "MCP: mcp.json", "MCP conecta al agente con herramientas y datos externos. Los servidores se declaran en .cursor/mcp.json (del proyecto) o ~/.cursor/mcp.json (para todos), o desde Customize. Cada llamada a una herramienta MCP te pide aprobación salvo que la pongas en la allowlist.", code`
// .cursor/mcp.json
{
  "mcpServers": {
    "local": {
      "command": "npx",
      "args": ["-y", "mcp-server"],
      "env": { "API_KEY": "\${env:MI_API_KEY}" }
    },
    "remoto": {
      "url": "https://ejemplo.com/mcp"
    }
  }
}`, "mcp model context protocol servidor mcp.json json herramientas"),
    m("MCP", "MCP desde la CLI", "La CLI usa el mismo mcp.json que el editor y suma comandos para verlos, iniciar sesión en los remotos con OAuth y aprobarlos.", code`
agent mcp list                 # servidores y su estado
agent mcp list-tools github    # herramientas de un servidor
agent mcp login github         # OAuth para un servidor remoto
agent mcp enable github        # aprobarlo
agent mcp disable github       # que no cargue`, "mcp cli list login enable disable oauth"),
    m("Seguridad", "Run Modes", "Deciden qué corre sin preguntarte. Auto-review (el recomendado) deja pasar lo que está en tu allowlist, corre el resto en el sandbox y, si no se puede, lo manda a un clasificador que lo aprueba, lo frena o te pregunta. Allowlist solo deja pasar lo de la lista. Run Everything corre todo, sin sandbox.", code`
# Settings > Agents > Approvals & Execution
# Auto-review    allowlist + sandbox + clasificador (por defecto)
# Allowlist      solo lo de la lista; con la lista vacia pregunta siempre
# Run Everything todo automatico, sin sandbox: solo en algo descartable
# protecciones aparte: borrar archivos, tocar fuera del proyecto, navegador`, "run modes permisos auto-review allowlist run everything yolo"),
    m("Seguridad", "Sandbox de la terminal", "Los comandos corren en un sandbox que deja leer y escribir dentro del proyecto y bloquea la red salvo una lista de dominios comunes (gestores de paquetes, hosts de código). Lo que necesita más acceso sale del sandbox y te pide aprobación.", code`
# macOS: Seatbelt (sandbox-exec)
# Linux: Landlock + seccomp (kernel 6.2 o mas nuevo)
#        si no hay soporte, pregunta antes de cada comando
# red: sandbox.json Only / sandbox.json + Defaults (por defecto) / Allow All
# rutas protegidas: .git/config, .git/hooks, .vscode, .cursorignore
/sandbox                       # configurarlo desde la CLI`, "sandbox seatbelt landlock red terminal aislamiento"),
    m("Seguridad", ".cursorignore", "Lista archivos que el agente no puede usar, además de lo que ya ignora .gitignore. Por defecto ya deja afuera .env, .git/ y los lockfiles. No es una barrera total: un comando de terminal o un MCP pueden leer igual esos archivos.", code`
# .cursorignore, en la raiz del proyecto
node_modules/
dist/
*.min.js
.env*
secretos/`, "cursorignore ignorar archivos secretos env"),
    m("Revisión", "Bugbot", "Revisa pull requests y deja comentarios con el error y una sugerencia de arreglo. Se conecta desde el panel de Cursor (GitHub, GitLab, Bitbucket, Azure DevOps). Corre en cada actualización del PR o cuando lo llamás con un comentario. Sus reglas van en .cursor/BUGBOT.md; las .mdc no le aplican.", code`
# en un comentario del PR:
cursor review
bugbot run

# .cursor/BUGBOT.md
- Marca cualquier consulta SQL armada concatenando strings
- Los endpoints nuevos necesitan test

# Autofix: lanza un Cloud Agent que empuja el arreglo`, "bugbot revision pr pull request review github autofix"),

    // ── AVANZADO ──
    a("CLI", "Modo no interactivo (CI)", "Con -p (--print) la CLI responde y termina, para scripts y CI. Como no puede preguntarte, rechaza lo que necesitaría aprobación, salvo que agregues --force. En CI se autentica con CURSOR_API_KEY.", code`
export CURSOR_API_KEY=tu_clave
agent -p "resumi los cambios de este PR"
agent -p --output-format json "lista los TODO"
agent -p --output-format stream-json --stream-partial-output "..."
agent -p --force "arregla el lint"   # aprueba todo salvo lo de deny
# un admin puede desactivar el modo headless para el equipo`, "headless print -p ci script json api key force"),
    a("CLI", "Configuración y permisos de la CLI", "La configuración global está en ~/.cursor/cli-config.json (en Windows, en tu carpeta de usuario). En el proyecto, .cursor/cli.json solo admite permisos. Cada permiso es Tipo(patrón) y deny siempre gana sobre allow.", code`
// ~/.cursor/cli-config.json
{
  "version": 1,
  "editor": { "vimMode": false },
  "approvalMode": "auto-review",
  "permissions": {
    "allow": ["Shell(git)", "Read(src/**/*.ts)", "Mcp(datadog:*)"],
    "deny":  ["Shell(rm)", "Read(.env*)", "Write(**/*.key)"]
  }
}`, "cli-config.json cli.json permisos allow deny shell read write"),
    a("Seguridad", "Shell(git) deja pasar git push", "Shell() mira solo la primera palabra del comando, así que aprueba más de lo que parece: Shell(git) permite cualquier subcomando de git, incluido git push. Dejá en allow solo comandos inofensivos y mandá a deny lo peligroso; lo que no está en ninguna lista te lo pregunta.", code`
{
  "permissions": {
    "allow": ["Shell(ls)", "Shell(pwd)"],
    "deny":  ["Shell(rm)", "Shell(curl)", "Shell(sudo)"]
  }
}
# Shell(git) en allow tambien aprobaria git push
# deny gana sobre allow`, "permisos prefijo git push deny seguridad"),
    a("Seguridad", "Repos que no conocés", "Workspace Trust viene apagado. Si lo activás, un repo nuevo puede abrirse en modo restringido, sin funciones de IA. Para código que no conocés, combiná eso con Ask (solo lectura), sin Run Everything, y revisá el .cursor/ del repo: puede traer reglas, hooks y MCP propios.", code`
# antes de dejar al agente suelto en un repo ajeno, mira:
#   .cursor/rules/   AGENTS.md   CLAUDE.md   (instrucciones)
#   .cursor/mcp.json                       (servidores MCP)
#   .cursor/hooks.json                     (scripts que se ejecutan)
# y usa Ask para explorar sin que edite nada`, "workspace trust repo ajeno prompt injection restringido"),
    a("Revisión", "Agent Review", "Corre una revisión de código sobre tus cambios locales, antes de abrir el PR. Usa las mismas reglas que Bugbot (BUGBOT.md) y tiene dos profundidades: Quick y Deep.", code`
/agent-review     # en la caja del agente
# o desde la pestana Source Control: revisa contra main
# tambien se puede activar para que corra despues de cada commit`, "agent review revision local commit bugbot"),
    a("Modelos y planes", "Auto, Cursor Router y Max Mode", "Auto elige el modelo por vos. En planes individuales solo hay Auto en modo Cost (modelos de Cursor). Balance e Intelligence usan el Cursor Router para elegir también modelos de terceros, en Teams y Enterprise. Max Mode, que agranda la ventana de contexto, quedó solo en los planes viejos.", code`
# Auto Cost         modelos de Cursor, sale del pool semanal
# Auto Balance      Cursor Router, Teams/Enterprise
# Auto Intelligence Cursor Router, Teams/Enterprise
# Max Mode          solo planes por pedido (legacy): /max-mode en la CLI`, "auto cursor router max mode contexto modelos"),
    a("Agente", "Memoria: ya no hay Memories", "Cursor tuvo una función Memories que guardaba datos entre chats, pero se quitó. Hoy hay tres cosas distintas: las instrucciones estables van en reglas o en AGENTS.md; un chat viejo puntual se trae con @Chats; y el Agent tiene una herramienta para buscar solo en conversaciones anteriores. Lo que no hay es una memoria automática que guarde datos sueltos.", code`
# lo que querias que "recuerde":
#   en el proyecto  -> .cursor/rules/*.mdc o AGENTS.md
#   para vos        -> User Rules (Customize > Rules)
#   para el equipo  -> Team Rules (panel de Cursor)
# para un chat viejo puntual: @Chats
# el Agent tambien puede buscar solo en conversaciones anteriores`, "memoria memories recordar reglas"),
    a("Comparación", "Cursor vs. Claude Code y Codex: dónde viven", "Cursor es ante todo un editor (un fork de VS Code) con agente adentro, más una CLI. Claude Code y Codex nacieron como agentes de terminal, con extensiones para editores (incluido Cursor). Si querés el agente adentro del editor, con Tab y diffs visuales, Cursor; si vivís en la terminal, cualquiera de los tres tiene CLI.", code`
# Cursor:      app (editor) + Agents Window + CLI "agent" + nube
# Claude Code: CLI "claude" + extensiones + app de escritorio + web
# Codex:       CLI "codex" + extension (VS Code, Cursor) + app + nube
# los tres: MCP, instrucciones de proyecto y modos de permisos`, "comparacion claude code codex editor cli"),
    a("Comparación", "Cursor vs. Claude Code y Codex: instrucciones y modelos", "Cursor lee .cursor/rules y AGENTS.md (la CLI también CLAUDE.md); Codex lee AGENTS.md; Claude Code, CLAUDE.md. Un AGENTS.md compartido sirve para los tres. La otra diferencia grande: Cursor deja elegir modelos de varios proveedores (propios, Anthropic, OpenAI, Google, xAI), mientras Claude Code se integra sobre todo con Claude y Codex con los de OpenAI (su CLI también acepta modelos locales con --oss).", code`
# instrucciones:  Cursor -> .cursor/rules + AGENTS.md (+ CLAUDE.md en la CLI)
#                 Codex  -> AGENTS.md
#                 Claude Code -> CLAUDE.md (o AGENTS.md si no hay)
# modelos:        Cursor -> Composer, Grok, Claude, GPT, Gemini y otros
#                 Claude Code -> Claude   Codex -> OpenAI (la CLI acepta locales: --oss)`, "comparacion agents.md claude.md reglas modelos proveedores"),
    a("Comparación", "Cursor vs. Claude Code y Codex: permisos", "Cursor usa Run Modes (Auto-review, Allowlist, Run Everything) más un sandbox; Codex separa sandbox y aprobación; Claude Code tiene modos de permisos (default, acceptEdits, plan, auto, dontAsk, bypassPermissions). En los tres, el modo de no preguntar nada es solo para un contenedor o máquina descartable.", code`
# Cursor:      Auto-review / Allowlist / Run Everything + sandbox
# Codex:       sandbox (read-only/workspace-write/danger-full-access)
#              + aprobacion (on-request/never)
# Claude Code: default/acceptEdits/plan/auto/dontAsk/bypassPermissions
# en los tres: el modo sin frenos, solo en algo descartable`, "comparacion permisos sandbox run modes bypass"),
  ],
  clase: claseCursor,
};
