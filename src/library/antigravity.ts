import { type Topic, a, b, code, m } from "./types";
import { claseAntigravity } from "./clases/antigravity";

export const antigravity: Topic = {
  id: "antigravity",
  name: "Antigravity",
  group: "IA",
  emblem: null,
  badge: "AG",
  color: "#3186ff",
  hl: "linux",
  summary:
    "Antigravity es la plataforma de desarrollo con agentes de Google. Tiene una app de escritorio para lanzar y revisar agentes (con terminal, navegador y artefactos), " +
    "una CLI (agy), extensiones para varios editores, el Antigravity IDE original y un SDK de Python. Acá está cómo se instala, sus modos de permisos, " +
    "las reglas del proyecto (AGENTS.md, GEMINI.md), skills, MCP, los modelos que puede usar y una comparación con Claude Code y Codex.",
  alert: {
    title: "ANTES DE USAR ANTIGRAVITY: SEGURIDAD",
    items: [
      "El agente puede editar archivos, correr comandos en la terminal y manejar un navegador. Leé lo que te pide aprobar antes de decir que sí, sobre todo comandos con sudo, rm, curl o git push.",
      "El preset Turbo de la app (y --dangerously-skip-permissions en la CLI) saca el sandbox y aprueba todo, con acceso a todo el disco. Usalo solo en una máquina o contenedor descartable.",
      "El navegador del agente abre páginas reales: lo que lee en una web, un issue o un README ajeno puede traer instrucciones escondidas (prompt injection). Tratalo como dato, nunca como una orden tuya, y no le des reglas amplias de execute_url.",
      "Los tokens que ponés en headers de mcp_config.json quedan en texto plano. No subas a git el .agents/mcp_config.json con claves, y agregá solo servidores MCP de fuentes confiables.",
      "Las reglas por prefijo aprueban más de lo que parece: command(git) deja pasar cualquier subcomando de git, incluido git push. Combiná los allow amplios con deny explícitos.",
      "No uses tu inicio de sesión de Antigravity en herramientas de terceros: va contra los términos y te pueden suspender la cuenta. Para eso está una API key de Gemini.",
      "Para tareas grandes usá el modo New worktree o hacé una rama antes: así tu carpeta queda intacta y podés descartar el trabajo del agente con git.",
    ],
    closing: "Antigravity trabaja mucho solo, y por eso conviene revisar los artefactos (plan, diff, informe) antes de aceptar: vos decidís qué se ejecuta y qué se publica.",
  },
  facts: [
    { label: "Ejecutar", value: "la app Antigravity · agy  (en la carpeta del proyecto)" },
    { label: "Una sola vez", value: "agy -p \"pregunta\"" },
    { label: "Memoria", value: "AGENTS.md · GEMINI.md · .agents/rules/" },
    { label: "Modelos", value: "Gemini 4 Hydrogen · Gemini 4 Argon · Claude Opus 5.5" },
    { label: "Ayuda", value: "? · /help · antigravity.google/docs" },
  ],
  workflow: [
    { title: "Empezá con las reglas del proyecto", text: "Antigravity lee AGENTS.md o GEMINI.md desde tu carpeta hasta la raíz del repo, más las reglas de .agents/rules/. Poné ahí cómo se instala, cómo se testea y qué no hay que tocar, y te ahorrás repetirlo en cada pedido." },
    { title: "Revisá el plan antes que el código", text: "En las tareas grandes el agente arma un plan de implementación como artefacto. Comentalo ahí (\"no toques la base\", \"usá la función que ya existe\") antes de que edite: corregir un plan es mucho más barato que corregir un diff." },
    { title: "Un worktree por tarea", text: "En la app, el modo New worktree crea un worktree de git para la conversación. Así podés tener varios agentes en paralelo sin que se pisen y tu carpeta de trabajo queda como estaba." },
    { title: "Elegí el preset según cuánto confiás", text: "Default corre comandos dentro del sandbox y te pregunta para lo de afuera. Request Review te pregunta todo. Turbo no frena nada: solo en un entorno descartable." },
    { title: "Dale una forma de verificarse", text: "Decile qué comando prueba el cambio (los tests, el build) y pedile el informe de verificación. Un agente que corre los tests cierra el bucle solo; uno que no, supone que salió bien." },
  ],
  entries: [
    // ── BÁSICO ──
    b("Primeros pasos", "Instalar la app", "La app de escritorio se baja de antigravity.google/download. Pide macOS 13 o más nuevo, Windows 10/11 de 64 bits o un Linux con glibc 2.28 o más (Ubuntu 20+, Debian 10+, Fedora 36+).", code`
# macOS: abri Antigravity.dmg y arrastra la app a Aplicaciones
#        (al actualizar, elegi Reemplazar, no Conservar ambos)
# Windows: corre el instalador .exe (x64 o ARM64)
# Linux:
tar -xzf Antigravity.tar.gz
./Antigravity`, "instalar descargar dmg exe tar linux windows macos requisitos"),
    b("Primeros pasos", "Instalar la CLI (agy)", "La CLI se llama agy y se instala con un script. En macOS y Linux queda en ~/.local/bin/agy; en Windows, en AppData\\Local\\agy\\bin.", code`
# macOS / Linux
curl -fsSL https://antigravity.google/cli/install.sh | bash
# Windows (PowerShell)
irm https://antigravity.google/cli/install.ps1 | iex
# comprobar
agy --version`, "instalar cli agy curl powershell script version"),
    b("Primeros pasos", "Primer inicio y cuenta", "En la app iniciás sesión con Google en el navegador y elegís tu rol (Software Engineering, Knowledge Work…), que define cómo se acomoda la pantalla. En la CLI, la primera vez elegís colores, el modo de dibujo (Alt-Screen o Inline) y si confiás en la carpeta.", code`
cd mi-proyecto
agy            # primera vez: colores, modo de pantalla, confiar en la carpeta
               # abre el navegador para iniciar sesion
# por SSH: imprime una URL, iniciás sesion en tu compu
#          y pegas el codigo en la terminal remota
/logout        # dentro de la sesion: cerrar sesion`, "login cuenta google iniciar sesion ssh logout primer inicio"),
    b("Primeros pasos", "Ejecutar agy", "agy abre la terminal interactiva en la carpeta donde estás. Con -i arrancás con un primer pedido y seguís en la sesión; con -p responde una vez y sale.", code`
agy                          # sesion interactiva
agy -i "explicame este repo" # arranca con un pedido y sigue abierta
agy -p "que hace main.py"    # responde y termina
agy -c                       # retoma la ultima conversacion
agy models                   # lista los modelos disponibles`, "agy ejecutar interactivo prompt continue models"),
    b("Comandos de sesión", "Comandos de /", "Dentro de agy, lo que empieza con / es una orden para la CLI, no para el modelo. ? muestra la ayuda y todos los comandos.", code`
/help          # ayuda
/model         # elegir modelo
/plan          # que arme un plan antes de tocar nada
/diff          # ver los cambios hechos
/permissions   # ver y cambiar permisos
/resume        # retomar otra conversacion
/rewind        # deshacer el ultimo paso (alias /undo)
/clear         # conversacion nueva (alias /new)
/exit          # salir (alias /quit)`, "slash comandos help model plan diff permissions resume rewind clear exit"),
    b("Comandos de sesión", "Atajos de la CLI", "Los atajos más usados dentro de agy. Además, @ sugiere archivos y ! al principio corre un comando de terminal directo.", code`
# Enter          enviar
# Shift+Enter    nueva linea (tambien Ctrl+J)
# Shift+Tab      cambiar de modo (default, accept-edits, auto, plan)
# Esc            cortar la respuesta o cerrar un menu
# Ctrl+C         interrumpir (dos veces sin nada corriendo: salir)
# Ctrl+O         ver el detalle de las herramientas
# Ctrl+R         revisar artefactos
# Ctrl+G         escribir el prompt en tu editor
# y / n          aprobar o rechazar un comando
@src/app.ts      # mencionar un archivo
!git status      # correr un comando sin pasar por el agente`, "atajos teclado shift tab esc ctrl arroba exclamacion"),
    b("La app", "Proyectos y worktrees", "En la app las conversaciones se agrupan en proyectos, que pueden tener varias carpetas (por ejemplo front y back). Al empezar elegís Local (trabaja en tu carpeta) o New worktree (crea un worktree de git aparte).", code`
# App: icono de proyecto nuevo -> agregar carpetas
#      al empezar: Local       = trabaja en tu carpeta
#                  New worktree = worktree de git para esa conversacion
# CLI:
agy --new-project              # crea un proyecto y abre la sesion ahi
agy --project=<id_del_proyecto>
# sin flags, la CLI usa el proyecto default-cli-project`, "proyecto carpetas worktree local git paralelo"),
    b("Cuentas y límites", "Planes y cuota", "Hay cuota sin plan pago (se renueva cada semana) y más cuota con Google AI Pro y Ultra (se renueva cada cinco horas, con tope semanal). Algunos modelos piden Pro o Ultra. Los precios y los números exactos cambian: miralos en la página de planes.", code`
# sin Pro/Ultra   cuota semanal limitada
# Google AI Pro   mas cuota, se renueva cada 5 horas
# Google AI Ultra la mayor cuota, modelos de terceros
# Empresas        Gemini Enterprise (Google Cloud)
/usage           # en la CLI: cuanto te queda (alias /quota)
# en la app: Settings, uso por modelo`, "planes pro ultra cuota limites creditos enterprise precio"),

    // ── INTERMEDIO ──
    m("Instrucciones", "AGENTS.md y GEMINI.md", "Las reglas del proyecto van en AGENTS.md o GEMINI.md. Antigravity los busca en tu carpeta y en cada carpeta de arriba hasta la raíz del repo, y suma todo lo que encuentra. Las reglas globales van en ~/.gemini/.", code`
# en el proyecto (de tu carpeta hasta la raiz del repo):
#   AGENTS.md  o  GEMINI.md
#   .agents/AGENTS.md  o  .agents/GEMINI.md
# globales, para todos tus proyectos:
#   ~/.gemini/AGENTS.md  o  ~/.gemini/GEMINI.md
# AGENTS.md
## Comandos
- instalar: npm install
- tests: npm test
## Reglas
- no agregar dependencias nuevas`, "agents.md gemini.md reglas instrucciones memoria proyecto"),
    m("Instrucciones", "Reglas en .agents/rules", "Para reglas que no tienen que estar siempre activas, poné un .md por regla en .agents/rules/ con un trigger en el encabezado. Sin trigger válido, la regla se descarta sin avisar.", code`
# .agents/rules/tests.md
---
trigger: glob
globs: "**/*.test.ts"
description: Como escribir tests en este repo
---
- usar describe/it, un archivo por modulo
# trigger: always_on | model_decision | glob | manual
# limite: 24000 bytes por archivo`, "rules reglas trigger glob always_on model_decision manual frontmatter"),
    m("Instrucciones", "Skills (antes workflows)", "Los workflows quedaron obsoletos: ahora se usan skills, una carpeta con un SKILL.md. Al principio solo se carga el nombre y la descripción; el resto, cuando hace falta. Se llaman con /nombre.", code`
# .agents/skills/deploy-staging/SKILL.md  (o ~/.gemini/config/skills/)
---
name: deploy-staging
description: Sube el build a staging. Usar al probar una version.
---
1. correr npm run build
2. ...
# en la sesion:
/deploy-staging
/skills reload        # CLI: volver a leer las skills`, "skills workflows skill.md migrar comandos propios"),
    m("Configuración", "settings.json de la CLI", "La configuración de agy vive en ~/.gemini/antigravity-cli/settings.json. /config la abre en pantalla completa y guarda ahí los cambios. \"agentMode\": \"\" (o no ponerlo) es el modo default.", code`
{
  "agentMode": "",
  "model": "Gemini 4 Hydrogen",
  "colorScheme": "terminal",
  "toolPermission": "request-review",
  "enableTerminalSandbox": true,
  "permissions": { "allow": ["command(git status)"], "deny": ["command(sudo)"] }
}`, "settings json configuracion config agentmode colorscheme"),
    m("Modelos", "Elegir modelo", "En la app, el selector está debajo de la caja del prompt y vale para esa conversación. En la CLI, /model guarda la elección para las próximas sesiones; --effort cambia cuánto razona.", code`
agy models                              # nombres disponibles
agy --model "Gemini 4 Hydrogen"         # al arrancar
agy -p "..." --model gemini-3.8-flash-medium
agy --effort high                       # nivel de razonamiento
/model                                  # dentro de la sesion
/effort high`, "modelo model effort razonamiento gemini claude selector"),
    m("Trabajo del agente", "Artefactos", "Son lo que el agente entrega para que revises su trabajo sin mirar cada paso: el plan de implementación, el walkthrough, los diffs, capturas y grabaciones del navegador. Podés comentarlos y el agente toma esos comentarios.", code`
# tipos: plan de implementacion, walkthrough,
#        diffs, capturas, grabaciones del navegador
# App: panel Artifacts, al costado de la conversacion
# CLI:
/artifact      # ver los artefactos
# Ctrl+R       panel de revision
# Shift+A      aprobar todos los artefactos del panel`, "artefactos plan walkthrough capturas grabaciones revisar comentar"),
    m("Permisos", "Modos de la CLI", "Shift+Tab, --mode o \"agentMode\" eligen el modo. default (el que se usa si no pasás --mode; en settings.json es \"agentMode\": \"\") te muestra el diff antes de editar; accept-edits aprueba las ediciones pero sigue revisando comandos; auto aprueba ediciones y corre comandos en el sandbox (no está en cuentas de empresa); plan solo planifica.", code`
agy                       # sin --mode: default, revisas cada diff
agy --mode=accept-edits   # edita solo; los comandos se revisan igual
agy --mode=auto           # edita y corre en el sandbox sin preguntar
agy --mode=plan           # arma el plan sin tocar archivos
# toolPermission en settings.json:
#   request-review | proceed-in-sandbox | strict | always-proceed
# strict y always-proceed pisan al modo auto`, "modos default accept-edits auto shift tab toolpermission"),
    m("Permisos", "Presets de permisos de la app", "En Settings, Global Permissions, Permission Preset elegís cuánto hace solo el agente. Cada proyecto puede tener el suyo; los nuevos arrancan en Inherit Global.", code`
# Request Review  sin sandbox, pregunta todo, solo el workspace
# Default         sandbox; afuera del sandbox pregunta
# Auto            sandbox; afuera lo evalua solo (no en empresas)
# Turbo           sin sandbox, todo el disco, no pregunta
# en Default y Auto el sandbox bloquea la red por defecto`, "presets permisos request review default auto turbo sandbox app"),
    m("Extender", "MCP: mcp_config.json", "Los servidores MCP se declaran en ~/.gemini/config/mcp_config.json (globales) o en .agents/mcp_config.json (del proyecto). Uno local lleva command; uno remoto, serverUrl con transporte Streamable HTTP. En la app también se agregan desde Customizations.", code`
{
  "mcpServers": {
    "mi-db": {
      "command": "node",
      "args": ["/ruta/al/servidor.js"]
    },
    "remoto": { "serverUrl": "https://api.ejemplo.com/mcp/" }
  }
}
# en la CLI: /mcp abre el administrador (estado, recargar, logs)`, "mcp servidores mcp_config serverurl herramientas extender"),

    // ── AVANZADO ──
    a("Permisos", "Reglas allow, ask y deny", "Las reglas tienen la forma accion(objetivo) y van en tres listas. Gana deny sobre ask, y ask sobre allow. Los comandos se comparan por prefijo, palabra por palabra, o con regex:.", code`
"permissions": {
  "allow": ["command(git status)", "command(regex:npm run (build|lint|test))"],
  "ask":   ["command(*)", "mcp(sql/execute_mutation)"],
  "deny":  ["command(sudo)", "command(rm -rf)", "write_file(.git/)"]
}
# acciones: read_file write_file read_url execute_url
#           download_url command mcp`, "permisos reglas allow ask deny command regex prefijo"),
    a("Permisos", "El navegador del agente", "execute_url decide qué páginas abre el subagente de navegador; read_url no alcanza para eso. Las descargas usan download_url y los ejecutables se bloquean. Subir archivos siempre pide aprobación, incluso en Turbo.", code`
"permissions": {
  "allow": ["execute_url(localhost)", "read_url(developer.mozilla.org)"],
  "deny":  ["execute_url(mail.google.com)"]
}
# localhost se separa por puerto
# Gmail, Docs, Drive y la consola de Cloud piden reglas explicitas`, "navegador browser execute_url download_url localhost subagente"),
    a("Automatizar", "agy -p en scripts y CI", "Con -p responde una vez y sale. La respuesta va a stdout y los avisos a stderr. Sin nadie que apruebe, lo que necesita permiso se rechaza en silencio (la corrida sigue y sale con 0), así que conviene preaprobar reglas concretas.", code`
agy -p "corre los tests y resumi los fallos" --print-timeout 10m
agy -p "..." --sandbox            # con las restricciones del sandbox
agy -p "..." --model gemini-3.8-flash-medium
# en CI la sesion tiene que estar guardada (corre agy una vez antes)
# o usa una API key: "modelProvider": "gemini" + GEMINI_API_KEY
# evitar: --dangerously-skip-permissions (aprueba todo)`, "headless ci script print no interactivo api key"),
    a("Automatizar", "Salida JSON y esquema", "--output-format json devuelve un sobre con status, response y usage; stream-json manda eventos línea por línea. Con --json-schema la respuesta parseada queda en structured_output.", code`
agy -p "dame la version de package.json" --output-format json | jq -r '.response'
agy -p "..." --output-format stream-json      # eventos NDJSON
agy -p "separa v2.14.3 en major, minor y patch" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"major":{"type":"integer"}}}' \
  | jq '.structured_output'
# status: SUCCESS, ERROR, CANCELED, INTERRUPTED...`, "json stream-json schema output jq structured_output"),
    a("Extender", "Venir de Gemini CLI", "agy reconoce lo de Gemini CLI: GEMINI.md sigue funcionando, las extensiones pasan a ser plugins y al primer inicio ofrece migrar la configuración. Los MCP se mudan a mcp_config.json y url/httpUrl pasa a llamarse serverUrl.", code`
agy                         # primer inicio: ofrece migrar lo de Gemini CLI
agy plugin import gemini    # extensiones de Gemini -> plugins
# skills del proyecto: .gemini/skills/  ->  .agents/skills/  (a mano)
# MCP: de ~/.gemini/settings.json a ~/.gemini/config/mcp_config.json
#      "url" o "httpUrl"  ->  "serverUrl"`, "gemini cli migrar plugins extensiones import"),
    a("Comparación", "Antigravity vs. Claude Code y Codex: instrucciones", "Los tres leen un archivo de reglas del proyecto. Antigravity acepta AGENTS.md y GEMINI.md, más reglas sueltas con trigger en .agents/rules/. Codex lee AGENTS.md; Claude Code lee CLAUDE.md (y AGENTS.md si es lo único que hay).", code`
# Antigravity: AGENTS.md o GEMINI.md + .agents/rules/*.md
# Claude Code: CLAUDE.md (usa AGENTS.md si no hay otro)
# Codex:       AGENTS.md (y AGENTS.override.md)
# un AGENTS.md bien escrito sirve para los tres`, "comparacion claude code codex agents.md claude.md gemini.md"),
    a("Comparación", "Antigravity vs. Claude Code y Codex: permisos", "Los tres combinan reglas por comando con un sandbox. Antigravity usa presets en la app (Request Review, Default, Auto, Turbo) y modos en la CLI; Claude Code, modos de permisos; Codex separa sandbox y aprobación. En todos, el modo sin frenos es solo para un entorno descartable.", code`
# Antigravity: app Request Review/Default/Auto/Turbo
#              cli default/accept-edits/auto + reglas allow/ask/deny
# Claude Code: default/acceptEdits/plan/auto/dontAsk/bypassPermissions
# Codex:       sandbox (read-only/workspace-write/danger-full-access)
#              + aprobacion, por separado`, "comparacion permisos sandbox turbo bypass modos"),
    a("Comparación", "Cuál conviene para qué", "Antigravity se apoya en una app gráfica con navegador, worktrees y artefactos para revisar, y atada a tu cuenta de Google. Claude Code y Codex nacieron en la terminal. Los tres hacen el mismo bucle de leer, actuar y verificar: lo que más cambia el resultado es cómo los usás.", code`
# con cualquiera de los tres:
# 1. reglas del proyecto escritas (AGENTS.md o equivalente)
# 2. una tarea concreta, con como verificarla
# 3. revisar el plan o el diff antes de aprobar
# 4. correr los tests
# el resultado depende mas de esto que de la herramienta`, "comparacion cual elegir claude codex antigravity"),
  ],
  clase: claseAntigravity,
};
