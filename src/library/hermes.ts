import { type Topic, a, b, code, m } from "./types";
import { claseHermes } from "./clases/hermes";

export const hermes: Topic = {
  id: "hermes",
  name: "Hermes",
  group: "IA",
  emblem: null,
  badge: "HA",
  color: "#ffd700",
  hl: "linux",
  summary:
    "Hermes Agent es el agente de IA de código abierto (licencia MIT) de Nous Research. Corre en la terminal (hermes), en una app de escritorio y en " +
    "chats como Telegram o Discord, y su idea central es aprender con el uso: guarda memoria entre sesiones y escribe sus propias skills (procedimientos " +
    "reutilizables). Funciona con casi cualquier proveedor de modelos. Acá está cómo se instala, sus comandos, la memoria y las skills, MCP, las " +
    "aprobaciones y los sandbox, y una comparación con Claude Code y Codex. En la pestaña Clase, la explicación completa.",
  alert: {
    title: "ANTES DE USAR HERMES: SEGURIDAD",
    items: [
      "Con el backend local (el de fábrica) Hermes corre los comandos en tu máquina, con tu usuario. Solo te frena ante los comandos que reconoce como peligrosos (rm -r, curl | sh, DROP TABLE…): leé bien qué te pide aprobar antes de decir que sí.",
      "El modo YOLO (--yolo, /yolo o approvals.mode: off) deja de preguntarte todo, salvo una lista mínima de desastres (rm -rf /, mkfs, una fork bomb). Usalo solo dentro de un contenedor o una máquina descartable.",
      "Con los backends de contenedor (docker, modal, daytona, vercel_sandbox) Hermes ya no revisa los comandos: el contenedor es el límite. No le pases variables con secretos (docker_forward_env) si no hace falta, porque el código que corre adentro las puede leer.",
      "Las claves van en ~/.hermes/.env (con chmod 600) y nunca en el chat ni en un repositorio. Los servidores MCP solo reciben las variables que declarás en su env.",
      "AGENTS.md, un README ajeno, una página web o la respuesta de un servidor MCP pueden traer instrucciones escondidas (prompt injection). Hermes escanea los archivos de contexto, pero el escaneo es heurístico: tratá todo contenido de afuera como no confiable.",
      "Si conectás el gateway de mensajería, cualquiera que pueda escribirle al bot puede pedirle que actúe en tu máquina. Usá listas de usuarios permitidos o códigos de emparejamiento, nunca GATEWAY_ALLOW_ALL_USERS=true, y no lo corras como root.",
      "Instalá solo desde los dominios oficiales (hermes-agent.nousresearch.com, github.com/NousResearch): hay sitios y cuentas falsas que se hacen pasar por Hermes.",
    ],
    closing: "Hermes puede hacer mucho solo, y justamente por eso vos decidís dónde corre, qué puede tocar y quién le puede hablar.",
  },
  facts: [
    { label: "Ejecutar", value: "hermes  ·  hermes --tui (interfaz nueva)" },
    { label: "Una sola vez", value: "hermes -z \"pregunta\"  ·  hermes chat --oneshot -q \"…\"" },
    { label: "Memoria", value: "~/.hermes/memories (MEMORY.md, USER.md) · AGENTS.md" },
    { label: "Modelos", value: "Nous Portal, OpenRouter, Anthropic, OpenAI, Google, locales… (hermes model)" },
    { label: "Ayuda", value: "/help · hermes doctor · hermes-agent.nousresearch.com/docs" },
  ],
  workflow: [
    { title: "Primero una charla que funcione", text: "La guía oficial insiste en esto: antes de sumar gateway, cron o skills, conseguí una conversación normal que ande con hermes model y hermes doctor. Si la base falla, cada capa nueva te esconde el error." },
    { title: "Elegí dónde corren los comandos", text: "Para tu proyecto, el backend local con aprobaciones en smart o manual. Para código ajeno, un bot siempre prendido o tareas largas sin mirar, terminal.backend: docker (o ssh a otra máquina): ahí lo que rompa queda adentro." },
    { title: "Cortá sesiones en los límites naturales", text: "La memoria se carga al empezar cada sesión. Con /new al terminar una tarea o cambiar de tema, Hermes relee MEMORY.md y USER.md actualizados y arranca con un contexto corto y barato." },
    { title: "Revisá lo que aprende", text: "Hermes escribe memoria y skills solo. Mirá ~/.hermes/memories y ~/.hermes/skills de vez en cuando, y si querés controlarlo, activá write_approval para aprobar cada escritura antes de que quede guardada." },
    { title: "Las reglas del proyecto, en un archivo", text: "Lo que vale para un repositorio (cómo testear, qué no tocar) va en AGENTS.md, que también leen Codex y otros agentes. La memoria de Hermes es para lo tuyo: tu máquina, tus preferencias." },
  ],
  entries: [
    // ── BÁSICO ──
    b("Primeros pasos", "Instalar Hermes", "Hay un script por sistema. En macOS (Apple Silicon) y Windows también podés bajar Hermes Desktop desde la web oficial, que trae la CLI incluida. En Android va por Termux.", code`
# Linux, macOS y WSL2
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
source ~/.bashrc          # o ~/.zshrc, para que aparezca el comando

# Windows nativo, en PowerShell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)

# Android (Termux, aarch64), despues de agregar su repo APT firmado
pkg install hermes-agent`, "instalar install.sh powershell windows mac linux wsl termux desktop"),
    b("Primeros pasos", "Primer inicio: hermes setup", "La primera vez corré el asistente. Ofrece tres caminos: Quick Setup con Nous Portal (inicio de sesión OAuth, sin claves), Full Setup (elegís todo con tus propias claves) y Blank Slate (solo lo mínimo: modelo, archivos y terminal). Si encuentra Claude Code, Codex o Cursor instalados, ofrece importar su configuración.", code`
hermes setup              # asistente completo
hermes setup --portal     # atajo: login en Nous Portal y listo
hermes portal info        # que quedo configurado del Portal
hermes                    # empezar a charlar`, "setup asistente primer inicio portal blank slate"),
    b("Primeros pasos", "Conectar un proveedor de modelos", "hermes model te lleva paso a paso: elegís proveedor, iniciás sesión o pegás la clave, y elegís modelo. Las claves quedan en ~/.hermes/.env; hermes auth maneja las credenciales (reemplaza a los viejos hermes login y logout).", code`
hermes model                                   # elegir proveedor y modelo
hermes config set OPENROUTER_API_KEY sk-or-... # guarda la clave en .env
hermes auth add anthropic --type oauth         # login con OAuth
hermes auth list                               # credenciales guardadas
hermes auth logout anthropic`, "model proveedor api key auth login openrouter anthropic oauth"),
    b("Primeros pasos", "Ejecutar: CLI clásica o TUI", "hermes abre la CLI clásica, que es la de fábrica. hermes --tui abre la TUI, una interfaz de terminal más nueva (con mouse y ventanas emergentes) que la documentación recomienda. Las dos comparten sesiones, comandos y configuración.", code`
hermes                    # CLI clasica (por defecto)
hermes --tui              # TUI moderna (recomendada)
hermes -c                 # retomar la ultima sesion
hermes --resume ID        # retomar una sesion por id o titulo
# para que la TUI sea la de siempre, en ~/.hermes/config.yaml:
#   display:
#     interface: tui`, "tui cli ejecutar abrir continue resume interfaz"),
    b("Primeros pasos", "Diagnóstico y actualización", "hermes doctor revisa la instalación y te dice qué falta y cómo arreglarlo. hermes update baja la última versión estable (o la del canal que elegiste). Si algo anda raro, la guía sugiere este orden: doctor, model, setup.", code`
hermes doctor             # diagnostico: dice que falta y como arreglarlo
hermes update             # ultima version estable
hermes update --check     # ver si hay version nueva sin instalar
hermes --version
hermes config check       # opciones que faltan despues de actualizar`, "doctor update version diagnostico actualizar"),
    b("Comandos de sesión", "Comandos de /", "Dentro de la sesión, escribí / y aparece un menú con autocompletado. Estos comandos los resuelve Hermes, no el modelo. Cada skill instalada también se vuelve un comando: /nombre-de-la-skill.", code`
/help          # todos los comandos
/new           # sesion nueva (alias: /reset)
/model         # ver o cambiar el modelo
/tools         # herramientas disponibles
/skills        # buscar e instalar skills
/status        # modelo, sesion, tokens y un resumen
/context       # que ocupa la ventana de contexto
/compress      # resumir la conversacion para liberar contexto
/init          # crear o actualizar AGENTS.md
/quit          # salir (tambien /exit)`, "slash comandos help new model tools skills status context compress init"),
    b("Comandos de sesión", "Modo shell con !", "Una línea que empieza con ! se corre como comando de la terminal, sin pasar por el modelo: no gasta tokens ni entra en la conversación. Corre siempre en tu máquina, aunque el agente use Docker o SSH. Los comandos peligrosos igual piden aprobación.", code`
!git status
!ls -la
!pytest -x tests
# no gasta tokens y no queda en el historial
# corre en el host, no en el backend docker/ssh del agente`, "shell bang exclamacion comando terminal directo"),
    b("Configuración", "AGENTS.md y archivos de contexto", "Hermes carga un solo archivo de proyecto por sesión, el primero que encuentra en este orden: .hermes.md (o HERMES.md), AGENTS.override.md, AGENTS.md, CLAUDE.md, .cursorrules. Dentro de un repositorio junta los AGENTS.md desde la raíz hasta tu carpeta. Aparte siempre carga ~/.hermes/SOUL.md, que define la personalidad.", code`
# AGENTS.md, en la raiz del proyecto
## Mi proyecto
- Instalar: npm install
- Tests: npm test
- Estilo: TypeScript estricto
- No toques la carpeta dist/

# /init lo genera mirando el repo
# --ignore-rules arranca sin cargar contexto, memoria ni skills`, "agents.md hermes.md claude.md cursorrules soul.md contexto instrucciones proyecto init"),
    b("Memoria", "Memoria entre sesiones", "Hermes guarda dos archivos en ~/.hermes/memories: MEMORY.md (notas del agente sobre tu entorno, unos 2200 caracteres) y USER.md (tu perfil y preferencias, unos 1375). Los escribe solo con la herramienta memory y se cargan al empezar cada sesión. Para lo que pasó en sesiones viejas usa session_search, una búsqueda sobre el historial.", code`
cat ~/.hermes/memories/MEMORY.md   # notas del agente
cat ~/.hermes/memories/USER.md     # tu perfil
# pedile: "guarda en memoria que el proyecto usa pnpm"
# si dice que lo guardo, fijate que este en el archivo:
# un "lo recuerdo" sin llamar a la herramienta no guarda nada
# lo nuevo se ve en la PROXIMA sesion (/new)`, "memoria memory.md user.md recordar session_search persistente"),
    b("Modelos", "Elegir modelo", "Con /model dentro de la sesión, -m y --provider al arrancar, o hermes model para dejarlo fijo. Cambiar de modelo en medio de una charla larga hace que el siguiente mensaje se cobre entero (se pierde la caché del prompt), así que conviene hacerlo al principio.", code`
/model                                   # elegirlo dentro de la sesion
/model openrouter:anthropic/claude-sonnet-4.6
hermes chat --provider openrouter --model anthropic/claude-sonnet-4.6
hermes model                             # dejarlo como predeterminado
# el modelo necesita al menos 64K tokens de contexto`, "modelo model provider elegir cambiar openrouter nous"),
    b("Seguridad", "Qué revisar antes de aprobar", "Cuando Hermes te pide aprobar un comando, esa pausa es tu control. Con el modo smart (el de fábrica) un modelo auxiliar evalúa el riesgo: aprueba solo lo inofensivo, niega lo claramente peligroso y te pregunta lo dudoso.", code`
# Antes de aprobar, fijate:
# 1. el comando: rm -r, sudo, curl | sh, chmod 777, DROP TABLE
# 2. los archivos: .env, ~/.ssh, configuracion de produccion
# 3. que sea lo que pediste, no algo de mas
# si dudas: no apruebes, pedile que te lo explique primero`, "seguridad aprobar revisar comando peligroso"),

    // ── INTERMEDIO ──
    m("Skills", "Skills: usar e instalar", "Una skill es un documento SKILL.md con un procedimiento para un tipo de tarea. Hermes trae un catálogo en ~/.hermes/skills y solo lee la skill entera cuando la necesita (antes ve nombre y descripción). Del Skills Hub se instalan con un escaneo de seguridad previo.", code`
hermes skills browse                     # todo lo disponible
hermes skills search kubernetes          # buscar
hermes skills install openai/skills/k8s  # instalar (escanea antes)
/k8s deploy the staging manifest         # usarla como comando
/github-pr-workflow /test-driven-development arregla el issue 123`, "skills hub instalar buscar slash skill.md catalogo"),
    m("Skills", "Cómo crea skills el agente", "Cuando resuelve una tarea de varios pasos, se equivoca y encuentra el camino, o vos lo corregís, Hermes guarda el procedimiento como skill con la herramienta skill_manage, en ~/.hermes/skills/<categoría>/<nombre>/SKILL.md. Con /learn le pedís que arme una a partir de una carpeta, una URL o lo que acaban de hacer.", code`
/learn como acabo de desplegar el servidor de staging
/learn https://docs.example.com/api/quickstart

# ~/.hermes/skills/devops/deploy-staging/SKILL.md
---
name: deploy-staging
description: Desplegar el servidor de staging
---
## When to Use
## Procedure
## Pitfalls
## Verification`, "skills skill_manage learn crear aprender procedimiento skill.md"),
    m("Configuración", "config.yaml y .env", "Todo vive en ~/.hermes/: config.yaml para la configuración, .env para claves y tokens, auth.json para los logins OAuth. hermes config set manda cada valor al archivo correcto: los nombres en MAYÚSCULAS van a .env, los que tienen puntos a config.yaml. Las opciones de la línea de comandos le ganan a los dos.", code`
hermes config                       # ver la configuracion
hermes config edit                  # abrir config.yaml en tu editor
hermes config get model
hermes config set terminal.backend docker   # va a config.yaml
hermes config set OPENROUTER_API_KEY sk-or-...  # va a .env
hermes config unset terminal.backend`, "config.yaml env configuracion auth.json hermes_home"),
    m("Aprobaciones y sandbox", "Modos de aprobación y YOLO", "approvals.mode decide qué pasa con los comandos peligrosos: smart (de fábrica), manual (pregunta siempre) u off (nunca). YOLO es lo mismo que off para una sesión. Ni YOLO saltea la lista dura: borrar /, formatear un disco o una fork bomb no se ejecutan nunca.", code`
# ~/.hermes/config.yaml
approvals:
  mode: smart             # smart | manual | off
  timeout: 300            # segundos esperando tu respuesta
  cron_mode: deny         # que hace cron ante un comando peligroso
  single_query_mode: deny # lo mismo para hermes chat -q

hermes --yolo             # sin preguntas para esta corrida
/yolo                     # prende o apaga YOLO en la sesion`, "approvals aprobacion smart manual off yolo permisos"),
    m("Aprobaciones y sandbox", "Backends de terminal (sandbox)", "terminal.backend decide dónde corren los comandos del agente: local (tu máquina, sin aislamiento), docker (un contenedor endurecido), ssh (otra máquina), o un sandbox en la nube (modal, daytona, vercel_sandbox). En los de contenedor no hay aprobaciones: el aislamiento es el contenedor.", code`
hermes config set terminal.backend docker   # aislar en un contenedor
hermes config set terminal.backend ssh      # correr en otro servidor
hermes config set terminal.backend local    # volver a tu maquina

# ~/.hermes/config.yaml
terminal:
  backend: docker
  container_memory: 5120      # MB
  container_persistent: true  # conservar archivos entre sesiones
  docker_forward_env: []      # vacio: ningun secreto entra al contenedor`, "sandbox docker ssh modal daytona vercel backend terminal aislamiento contenedor"),
    m("MCP", "MCP: agregar un servidor", "MCP (Model Context Protocol) conecta a Hermes con herramientas externas. hermes mcp add suma un servidor local (un comando) o remoto (una URL). También hay un catálogo de servidores aprobados por Nous. Las herramientas quedan con el nombre mcp_<servidor>_<herramienta>.", code`
hermes mcp catalog                 # servidores aprobados por Nous
hermes mcp install deepwiki        # instalar uno del catalogo
hermes mcp add docs --url https://ejemplo.com/mcp
hermes mcp add fs --command npx --args -y @modelcontextprotocol/server-filesystem /home/vos/proyectos
hermes mcp list
hermes mcp test docs               # probar la conexion
/reload-mcp                        # recargar sin reiniciar`, "mcp model context protocol servidor agregar catalogo"),
    m("MCP", "MCP en config.yaml", "Los servidores también se escriben a mano bajo mcp_servers. Un servidor local no hereda tus variables de entorno: solo recibe las básicas (PATH, HOME…) y las que pongas en su env. Con tools.include o tools.exclude elegís qué herramientas suma.", code`
# ~/.hermes/config.yaml
mcp_servers:
  github:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "\${GITHUB_TOKEN}"
    tools:
      include: [create_issue, list_issues]   # solo estas
  viejo:
    url: "https://mcp.legacy.internal"
    enabled: false                           # apagado`, "mcp config.yaml mcp_servers include exclude env"),
    m("Sesiones", "Retomar, nombrar y bifurcar", "Las sesiones se guardan en una base SQLite (~/.hermes/state.db) y al salir Hermes te imprime el comando para retomarla. Ponerle título ayuda a encontrarla; /branch hace una copia para probar otro camino sin perder la original.", code`
hermes sessions list             # sesiones anteriores
hermes -c "refactor auth"        # retomar por titulo
/title refactor auth             # nombrar la sesion actual
/sessions                        # selector interactivo
/branch prueba-otra-idea         # copia independiente (alias /fork)
/undo                            # sacar el ultimo intercambio`, "sesiones resume continue title branch fork historial"),
    m("Integraciones", "Gateway de mensajería", "El gateway es un proceso en segundo plano que conecta a Hermes con Telegram, Discord, Slack, WhatsApp, Signal, email, Matrix, Microsoft Teams y más. Es la misma sesión y la misma memoria: le escribís desde el celular y trabaja en la máquina donde corre.", code`
hermes gateway setup       # configurar plataformas (tokens, usuarios)
hermes gateway start       # arrancarlo
hermes gateway status
hermes pairing             # aprobar o revocar codigos de emparejamiento
# en el chat: /status, /stop, /new funcionan igual que en la CLI`, "gateway telegram discord slack whatsapp signal bot mensajeria"),
    m("Integraciones", "Tareas programadas (cron)", "Hermes programa tareas en lenguaje natural o con intervalos, con skills adjuntas, y manda el resultado al chat que elijas. Las ejecuta el gateway, así que tiene que estar corriendo. Una tarea programada no puede crear otras.", code`
/cron add "every 2h" "revisa el estado del servidor"
/cron add "in 30m" "recordame revisar el build"
hermes cron create "every 1h" "resumi los feeds" --skill blogwatcher
hermes cron list
# o pedirlo: "todos los dias a las 9 mandame por Telegram
#             un resumen de Hacker News"`, "cron programar tareas agenda recordatorio schedule"),
    m("Plataformas", "Desktop, dashboard y webapp", "Además de la terminal, Hermes tiene una app de escritorio (macOS Apple Silicon y Windows; en Linux se arma desde el código), un panel web para administrar configuración, claves y sesiones, y la webapp, que lleva el espacio de trabajo del Desktop al navegador. Todas comparten sesiones, memoria y skills.", code`
hermes desktop       # arma y abre la app de escritorio (alias: gui)
hermes dashboard     # panel web en http://127.0.0.1:9119
hermes webapp        # el workspace del Desktop en http://127.0.0.1:9120
hermes acp           # servidor ACP para integrarlo con editores`, "desktop app escritorio dashboard web webapp acp editor"),
    m("Modelos", "Modelos locales", "Con un servidor local (Ollama, llama.cpp, LM Studio, vLLM) no necesitás cuenta ni clave y la conversación no sale de tu máquina (salvo que el agente use herramientas en línea, como la búsqueda web). El requisito duro es la ventana de contexto: Hermes rechaza al arrancar modelos con menos de 64K tokens.", code`
hermes model        # elegir "Custom endpoint" y poner la URL
# contexto de 64K como minimo:
#   Ollama: en el Modelfile, PARAMETER num_ctx 64000
#   (Ollama arranca con 2048 tokens, muy poco para el agente)
llama-server -m modelo.gguf --ctx-size 65536
# los modelos chicos suelen fallar llamando herramientas`, "local ollama llama.cpp lm studio vllm contexto 64k offline"),

    // ── AVANZADO ──
    a("Automatizar", "Uso no interactivo y en CI", "hermes -z o hermes chat --oneshot -q responden y terminan. Ojo: en una terminal real, hermes chat -q solo arranca una sesión interactiva con ese primer mensaje. En estas corridas los comandos peligrosos se niegan por defecto (nadie puede aprobarlos). No encontré una GitHub Action oficial: se usa la CLI dentro del job.", code`
hermes -z "resumi los cambios del ultimo commit"
hermes chat --oneshot -q "revisa el lint" --quiet
hermes chat -q "inspecciona el repo" --format stream-json   # JSONL para programas
hermes chat --query-file prompt.txt --oneshot             # sin interpretar comillas ni \$()
# para CI, aislado de tu configuracion personal:
hermes chat --ignore-user-config --ignore-rules --oneshot -q "corre los tests"`, "headless no interactivo ci oneshot quiet stream-json script"),
    a("Seguridad", "Escrituras protegidas y checkpoints", "write_file y patch nunca pueden escribir en ~/.ssh, ~/.aws o los secretos de Hermes, y los .env de un proyecto no los puede leer (sí escribir). HERMES_WRITE_SAFE_ROOT limita las escrituras a las carpetas que digas. Con --checkpoints guarda una copia antes de cambios destructivos y /rollback la restaura.", code`
export HERMES_WRITE_SAFE_ROOT=/home/vos/proyecto:/home/vos/.hermes
hermes chat --checkpoints        # foto del disco antes de cambios destructivos
/rollback                        # lista los checkpoints
/rollback 2                      # vuelve al numero 2
hermes checkpoints               # estado de ~/.hermes/checkpoints`, "write safe root checkpoints rollback proteger escritura ssh"),
    a("Seguridad", "Contenido externo no es instrucción", "Antes de cargar AGENTS.md, .cursorrules o SOUL.md, Hermes los escanea buscando prompt injection (\"ignorá lo anterior\", comentarios escondidos, caracteres invisibles, robo de .env) y bloquea el archivo si encuentra algo. Las skills de un repositorio clonado no se cargan hasta que confiás en él.", code`
# si el escaneo encuentra algo, el archivo no se carga:
# [BLOCKED: AGENTS.md contained potential prompt injection ...]

hermes skills trust          # habilitar las skills de este repo
hermes skills untrust        # revocar
# el escaneo es heuristico: igual revisa lo que clonas`, "prompt injection agents.md escaneo skills trust confianza"),
    a("Seguridad", "Gateway en producción", "La guía oficial para un bot siempre prendido: listas explícitas de usuarios, backend de contenedor, límites de recursos, claves en .env con permisos 600, nunca como root, y revisar los logs.", code`
chmod 600 ~/.hermes/.env
hermes config set terminal.backend docker
# nunca: GATEWAY_ALLOW_ALL_USERS=true
# usar emparejamiento por codigo en vez de ids fijos
# correr el gateway con un usuario sin privilegios
tail ~/.hermes/logs/gateway.log`, "gateway produccion bot allowlist root seguridad logs"),
    a("Extender", "Importar desde Claude Code o Codex", "El plugin oficial agent-importers trae tu configuración de Claude Code (~/.claude), Codex CLI (~/.codex), Cursor u OpenClaw: instrucciones, permisos permitidos, skills y servidores MCP. Siempre te muestra el plan antes de escribir.", code`
hermes plugins install agent-importers
hermes import-agent claude-code --dry-run   # ver que traeria, sin tocar nada
hermes import-agent claude-code
hermes import-agent codex
# hermes setup lo ofrece solo si detecta esas carpetas`, "importar claude code codex cursor openclaw migrar plugin"),
    a("Comparación", "Hermes vs. Claude Code y Codex: memoria", "Claude Code lee CLAUDE.md y Codex lee AGENTS.md. Hermes lee esos archivos (uno por sesión, según su prioridad), pero además arma su propia memoria (MEMORY.md, USER.md), busca en sesiones viejas y escribe skills nuevas sin que se lo pidas: aprender con el uso es la idea central del proyecto.", code`
# Claude Code: CLAUDE.md
# Codex:       AGENTS.md
# Hermes:      .hermes.md > AGENTS.md > CLAUDE.md > .cursorrules (uno solo)
#              + ~/.hermes/memories (lo escribe el agente)
#              + ~/.hermes/skills  (procedimientos que crea y mejora)
# un AGENTS.md compartido sirve para los tres`, "comparacion claude codex memoria agents.md claude.md"),
    a("Comparación", "Hermes vs. Claude Code y Codex: permisos y modelos", "Codex separa sandbox y aprobación; Claude Code tiene modos de permisos. Hermes, con el backend local, no aísla nada: solo frena comandos peligrosos (con un modelo auxiliar en modo smart); el aislamiento real es elegir docker, ssh o un sandbox en la nube. Y mientras Claude Code usa modelos de Anthropic y Codex los de OpenAI, Hermes funciona con casi cualquier proveedor.", code`
# Claude Code: modos de permisos, modelos de Anthropic
# Codex:       sandbox + aprobacion, modelos de OpenAI
# Hermes:      aprobaciones (smart/manual/off) + backend de terminal
#              (local/docker/ssh/modal/daytona/vercel_sandbox),
#              cualquier proveedor compatible
# en los tres, "sin preguntar nada" es solo para algo descartable`, "comparacion permisos sandbox modelos proveedor claude codex"),
    a("Comparación", "Cuál conviene para qué", "Claude Code y Codex están pensados para programar en tu proyecto, atados a una cuenta (Anthropic u OpenAI). Hermes apunta a un asistente que vive en un servidor, te habla por Telegram, corre tareas programadas y acumula lo que aprende; es de código abierto y elegís el modelo. Para programar, el resultado depende más de cómo lo usás que de cuál elegís.", code`
# programar en tu repo, con buen soporte de tu proveedor:
#   Claude Code o Codex
# asistente siempre prendido, en chats, con cron y memoria propia,
# con el modelo que quieras (incluso local):
#   Hermes
# en cualquiera: contexto claro, tarea concreta,
# revisar el diff y correr los tests`, "comparacion cual conviene eleccion claude codex hermes"),
  ],
  clase: claseHermes,
};
