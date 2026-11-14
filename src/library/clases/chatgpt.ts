import { type Clase, code } from "../types";

export const claseChatgpt: Clase = {
  titulo: "ChatGPT para programar: qué es, cómo usarlo bien y cómo aprender con él",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es ChatGPT por dentro, cómo se instala, qué modelo elegir, " +
    "cómo pedirle código y depurar con él, cómo aprender sin que te haga la tarea, qué pasa con tus datos y cómo dar el salto a la **API de OpenAI**.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "ChatGPT es el **asistente conversacional** de OpenAI: le escribís en lenguaje natural y te responde con texto, código, tablas o archivos. Se usa en la web (chatgpt.com), en una app de escritorio y en el celular, siempre con la misma cuenta.",
        "Para quien programa resuelve tres cosas: **entender** (qué hace este código, qué significa este error), **arrancar** (un primer borrador de una función, un script, una consulta SQL) y **aprender** (que te explique un tema con ejemplos y te tome examen).",
        "Lo que no hace en el modo Chat es tocar tu proyecto: el código lo copiás, lo pegás y lo probás vos. Para un agente que lee tu repositorio, edita archivos y corre los tests está Codex, que tiene su propio tema en la Biblioteca.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "OpenAI lanzó ChatGPT el 30 de noviembre de 2022 como una vista previa gratuita, y en pocos meses se volvió la herramienta de IA más conocida. Desde entonces sumó planes pagos, modelos que razonan, archivos, búsqueda y apps propias.",
      ],
      lista: [
        "2022: lanzamiento de ChatGPT, gratuito, en la web.",
        "2023: llegan el plan Plus, el modelo GPT-4, las apps móviles y los **GPTs** personalizados.",
        "2024: app de escritorio para macOS y después para Windows; aparece Canvas, un editor al costado del chat.",
        "2025: modelos que razonan antes de responder, GPT-5 y el modo de estudio (\"Study and learn\").",
        "2026: la app de escritorio pasa a juntar **Chat, Work y Codex** en una sola ventana, hay versión para Linux (en preview), llega GPT-6 y los GPTs empiezan a migrarse a plugins.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      diagrama: "bucle",
      parrafos: [
        "Debajo hay un **modelo de lenguaje grande**: una red neuronal entrenada para predecir el siguiente pedazo de texto (un token) a partir de todo lo anterior. Todo lo que entra en la conversación (tus instrucciones, la memoria, los archivos del proyecto, el historial) ocupa la **ventana de contexto**, que es limitada.",
        "Alrededor del modelo, ChatGPT suma **herramientas**: buscar en la web, correr Python para analizar un archivo, leer tus documentos o usar un plugin. El modelo decide cuándo usar una, el resultado vuelve al contexto y con eso sigue respondiendo. Los modelos que razonan hacen ese ida y vuelta varias veces antes de contestarte.",
        "La consecuencia práctica: el modelo genera lo **más probable**, no algo verificado. Puede inventar una función que suena bien o una opción que no existe. Por eso cada respuesta con código se prueba antes de usarla.",
      ],
    },
    {
      heading: "Instalación paso a paso",
      parrafos: [
        "No hace falta instalar nada para la web: entrás a chatgpt.com y listo. La **app de escritorio** suma atajos, acceso a tus archivos y los modos Work y Codex. Bajala solo desde chatgpt.com/download: hay copias truchas en buscadores.",
      ],
      lista: [
        "macOS: bajá el `.dmg` desde chatgpt.com/download y arrastrá ChatGPT a Aplicaciones.",
        "Windows: Microsoft Store, o en la terminal `winget install --id 9PLM9XGG6VKS -s msstore`.",
        "Linux (preview): `.deb` para Ubuntu 24.04/26.04 y Debian 13, `.rpm` para Fedora 43/44 y un script para Arch, en x64 y ARM64.",
        "Celular: \"ChatGPT\" de OpenAI en el App Store (iOS) o en Google Play (Android).",
      ],
      codigo: [
        code`
# Linux: fijate la arquitectura y el paquete que te toca
uname -m                                  # x86_64 = x64, aarch64 = ARM64
cd ~/Downloads
sudo apt install ./chatgpt_amd64.deb      # Ubuntu / Debian
sudo dnf install ./chatgpt.x86_64.rpm     # Fedora
chatgpt                                   # abrir desde la terminal`,
      ],
    },
    {
      heading: "Tu primera sesión paso a paso",
      parrafos: [
        "Abrí la app (o la web) e iniciá sesión. En la app de escritorio te pregunta **dónde querés trabajar**: un chat nuevo, un proyecto o una carpeta de tu compu. Para empezar, elegí un chat.",
        "Arriba de la caja del prompt está el selector **Chat / Work**: dejalo en Chat. Escribí algo concreto, por ejemplo \"explicame qué hace este código\" y pegá diez líneas tuyas.",
        "Después pedile una mejora y comparala con tu versión. Si no entendés una línea, preguntale por esa línea. Al terminar, fijate en la barra lateral: el chat quedó guardado y lo podés retomar, renombrar o mover a un proyecto.",
      ],
    },
    {
      heading: "Atajos y funciones esenciales",
      parrafos: [
        "ChatGPT no es una CLI: sus \"comandos\" son **atajos de teclado** y funciones de la interfaz. Estos son los de la app de escritorio; en macOS se usa `Cmd` donde Windows y Linux usan `Ctrl`, y para cambiar de modo, `Ctrl` en macOS y `Alt` en Windows y Linux.",
      ],
      codigo: [
        code`
Ctrl + K  o  Ctrl + Shift + P   # menu de comandos
Ctrl + N  o  Ctrl + Shift + O   # chat nuevo
Ctrl + B  o  Ctrl + Shift + S   # barra lateral
Ctrl + Shift + M                # selector de modelo
Ctrl + ,                        # ajustes
Alt + 1 / 2 / 3                 # Chat / Work / Codex (Ctrl en macOS)
# Settings > Keyboard Shortcuts: buscar, cambiar o resetear atajos`,
      ],
      lista: [
        "**Proyectos**: agrupan chats, archivos (Sources) e instrucciones propias.",
        "Búsqueda web: ChatGPT busca cuando necesita información actual y te muestra las fuentes.",
        "Análisis de datos: escribe y corre Python sobre el archivo que subiste; \"View Analysis\" muestra el código.",
        "Plugins: lo conectan con Gmail, Google Drive, Slack y otros, desde la pestaña Plugins.",
        "Chat temporal: no queda en el historial ni en la memoria.",
      ],
    },
    {
      heading: "Configuración: instrucciones, memoria y proyectos",
      parrafos: [
        "Hay tres lugares para darle contexto, y conviene no mezclarlos. Las **instrucciones personalizadas** (en Settings > Personalization) valen para todos tus chats. Las **instrucciones de un proyecto** valen solo para los chats de ese proyecto. La **memoria** son cosas que ChatGPT recuerda de chats anteriores: útil, pero no garantizada.",
        "Lo que tiene que cumplirse siempre (el idioma, tu stack, \"no inventes\") va en instrucciones, no en la memoria. En Settings > Personalization también ves y borrás lo que recuerda, o la apagás.",
        "Un detalle importante: un proyecto de ChatGPT **no abre una carpeta de tu compu**. Los archivos se suben o se conectan como Sources. Para trabajar sobre las carpetas de un repo de verdad está Codex.",
      ],
      codigo: [
        code`
# Instrucciones de un proyecto "Mi app" (ejemplo)
Respondeme en espanol, corto y con ejemplos.
Uso React 19, TypeScript estricto y Vite.
No propongas librerias nuevas sin preguntar.
Cuando me des codigo, decime como probarlo.
Si no estas seguro de que algo exista, decimelo.`,
      ],
    },
    {
      heading: "Modelos que puede usar",
      parrafos: [
        "En **Chat** elegís cuánto piensa GPT-6 con el selector de modelo: Instant contesta enseguida; Medium, High y Extra High razonan más antes de responder; Pro usa GPT-6 Astra. En **Work** y en Codex aparecen además los modelos de la familia GPT-6.1. Los nombres cambian seguido: mirá el selector y la página de modelos antes de memorizarlos.",
        "La regla práctica: **el más liviano que te alcance**. Más razonamiento es más lento y gasta más cupo de tu plan.",
      ],
      tabla: {
        cabeza: ["Modelo o nivel", "Para qué", "Dónde está"],
        filas: [
          ["GPT-6 Instant", "Preguntas rápidas, sintaxis, explicaciones cortas", "Chat, todos los planes (Free y Go con límites)"],
          ["GPT-6 Medium / High / Extra High", "Depurar, diseñar una función, revisar código", "Chat, en planes pagos con razonamiento avanzado"],
          ["GPT-6 Pro (con Astra)", "Problemas difíciles donde la calidad pesa más que el tiempo", "Chat en Pro, Business y Enterprise"],
          ["GPT-6 Astra (`gpt-6-astra`)", "El más capaz: análisis y entregables exigentes", "Work, Codex y la API"],
          ["GPT-6.1 Sol (`gpt-6.1-sol`)", "Trabajo técnico largo, casi como Astra pero más barato", "Work, Codex y la API (no en Chat)"],
          ["GPT-6.1 Terra (`gpt-6.1-terra`)", "Rápido: arreglos de código acotados, texto, imágenes", "Work, Codex y la API (no en Chat)"],
          ["GPT-6 Luna (`gpt-6-luna`)", "Lo más eficiente: resumir, extraer, tareas acotadas", "Work, Codex (también en Free y Go) y la API"],
        ],
      },
    },
    {
      heading: "Cómo se ve la app",
      parrafos: [
        "A la izquierda, la **barra lateral**: arriba elegís entre ChatGPT y Codex, después vienen New chat, Projects, Plugins y Scheduled, y abajo la lista de chats recientes. A la derecha, la conversación, y abajo de todo la **caja del prompt**, con el selector Chat / Work arriba y el selector de modelo (`Ctrl + Shift + M`).",
      ],
      captura: {
        tipo: "app",
        titulo: "ChatGPT",
        paneles: [
          {
            nombre: "Barra lateral",
            ancho: 1,
            lineas: [
              [{ t: "ChatGPT ▾", c: "fuerte" }],
              [],
              [{ t: "✎ New chat" }],
              [{ t: "▣ Projects" }],
              [{ t: "▦ Plugins" }],
              [{ t: "◷ Scheduled" }],
              [],
              [{ t: "Chats", c: "tenue" }],
              [{ t: "Fix retry handling", c: "sel" }],
              [{ t: "Explore API patterns", c: "tenue" }],
              [{ t: "Plan a launch brief", c: "tenue" }],
            ],
          },
          {
            nombre: "Conversación",
            ancho: 2.2,
            lineas: [
              [{ t: "Vos: ", c: "fuerte" }, { t: "este fetch reintenta para siempre" }],
              [{ t: "     cuando el servidor da 500. Por que?" }],
              [],
              [{ t: "ChatGPT: ", c: "acento" }, { t: "el contador se reinicia en cada" }],
              [{ t: "llamada. Proba sacarlo afuera de la funcion:" }],
              [{ t: "  let intentos = 0;", c: "tenue" }],
              [],
              [{ t: "        Chat ", c: "sel" }, { t: " Work", c: "tenue" }],
              [{ t: "┌──────────────────────────────────────┐", c: "tenue" }],
              [{ t: "│ ", c: "tenue" }, { t: "Ask anything", c: "tenue" }],
              [{ t: "│ +", c: "tenue" }, { t: "                       GPT-6 ▾", c: "acento" }],
              [{ t: "└──────────────────────────────────────┘", c: "tenue" }],
            ],
          },
        ],
        pie: "La app de escritorio con la barra lateral, un chat de depuración y la caja del prompt. Recreación de la pantalla de la app de ChatGPT de noviembre de 2026 según las ilustraciones de la documentación oficial (el texto de la caja y la posición del selector de modelo son aproximados), no es una captura.",
      },
    },
    {
      heading: "Cómo pedirle código y depurar",
      parrafos: [
        "Un buen pedido tiene **cuatro partes**: contexto (lenguaje, versión, qué proyecto), tarea exacta, restricciones (qué no puede cambiar, sin librerías nuevas) y formato de la respuesta (solo el diff, con tests, con explicación corta). Pegá el fragmento que importa, no el repo entero.",
        "Para depurar, dale el **error completo** (el stack trace entero, no \"me tira un error\"), el código que lo dispara, qué esperabas y qué ya probaste. Pedile hipótesis ordenadas y cómo comprobar cada una antes que un parche: así entendés el bug en vez de taparlo.",
        "Si la respuesta no sirve, afiná el pedido (sumá la restricción que faltaba) en vez de pedir \"otra vez\". Y si el chat se hizo muy largo y empieza a mezclar cosas, abrí uno nuevo con un resumen: el contexto viejo también confunde.",
      ],
      codigo: [
        code`
"Uso Python 3.13. Esta funcion deberia devolver la suma de los
precios con IVA, pero con [100, 200] me da 363.00000000000006
en vez de 363. Pego la funcion abajo.
1. Explicame por que pasa, en dos lineas.
2. Proponeme el arreglo mas chico, sin librerias externas.
3. Agrega un test con pytest que falle antes y pase despues."`,
        code`
"Revisa este codigo como si fuera un pull request:
marca bugs, casos borde y problemas de seguridad,
ordenados por gravedad. No lo reescribas: solo comentarios."`,
      ],
    },
    {
      heading: "Aprender sin que te haga la tarea",
      parrafos: [
        "Si le pedís la solución de un ejercicio, la vas a tener en segundos y no vas a aprender nada: **el que programa tiene que ser vos**. Usalo como un profesor paciente, no como alguien que hace la tarea por vos.",
        "OpenAI tiene un **modo de estudio** (\"Study and learn\") que guía con preguntas y pistas en vez de dar la respuesta; si está en tu cuenta, activalo. Si no, pedíselo vos con un prompt como el de abajo.",
      ],
      lista: [
        "Pedile que te explique el concepto con un ejemplo distinto del de tu ejercicio.",
        "Escribí vos la primera versión y después pedile que la revise, sin reescribirla.",
        "Pedile que te haga preguntas o un ejercicio parecido para ver si lo entendiste.",
        "Si te trabás, una pista por vez, no la solución.",
        "Si en tu curso no se permite usar IA, respetalo: es una regla, no una sugerencia.",
      ],
      codigo: [
        code`
"Estoy aprendiendo recursion en JavaScript. No me des la solucion.
Tengo que calcular el factorial de n. Hace de profesor:
preguntame cual seria el caso base, dame una pista por vez
si me trabo, y cuando te mande mi codigo, decime que esta bien
y que mejorarias, sin escribirlo por mi."`,
      ],
    },
    {
      heading: "Privacidad y controles de datos",
      parrafos: [
        "En los planes personales (Free, Go, Plus, Pro), tus chats **pueden usarse para entrenar** modelos salvo que apagues \"Improve the model for everyone\" en los controles de datos. Esa opción vale para toda la cuenta, también para las tareas de Codex; pero Codex tiene **otro ajuste aparte**, \"Include environments\", para el contexto extra de sus entornos, y apagar el primero no lo cambia. Apagarla no borra los chats que ya tenés, y archivar un chat no cambia nada.",
        "En Business, Enterprise y Edu no se entrena con tus datos por defecto. Y en la API de OpenAI tampoco, salvo que lo actives; ojo que la Responses API guarda por defecto el estado de la conversación (`store`), y `store=false` no equivale a retención cero.",
        "Para algo que no querés que quede, usá un **chat temporal**: no aparece en el historial, no crea recuerdos y no se usa para entrenar, aunque OpenAI puede guardarlo hasta 30 días por seguridad. Aun así, nunca pegues claves, contraseñas ni datos de otras personas.",
      ],
    },
    {
      heading: "La API de OpenAI para programadores",
      parrafos: [
        "Si querés usar los modelos desde tu propio programa, eso es la **API**: es aparte del plan de ChatGPT, se cobra por uso y se maneja desde platform.openai.com. Creás una clave, la guardás en la variable `OPENAI_API_KEY` e instalás el SDK oficial (`openai` en npm y en pip).",
        "El punto de entrada es la **Responses API**: `client.responses.create()` con un `model` y un `input`, y la respuesta en `output_text`. El cliente lee la clave de la variable de entorno solo, así que no la tenés que escribir en el código.",
      ],
      codigo: [
        code`
export OPENAI_API_KEY="tu_clave"   # macOS / Linux (Windows: setx)
npm install openai
pip install openai`,
        {
          lang: "javascript",
          text: code`
// ejemplo.mjs  ->  node ejemplo.mjs
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-6-astra",
  input: "Explica en una linea que es una promesa en JavaScript.",
});

console.log(response.output_text);`,
        },
        {
          lang: "python",
          text: code`
# ejemplo.py  ->  python ejemplo.py
from openai import OpenAI

client = OpenAI()
response = client.responses.create(
    model="gpt-6-astra",
    input="Explica en una linea que es un generador en Python.",
)
print(response.output_text)`,
        },
      ],
    },
    {
      heading: "Seguridad y buenas prácticas",
      parrafos: [
        "La regla de fondo: **lo que te devuelve es un borrador**, no una verdad. Y lo que lee de afuera es un dato, no una orden tuya.",
      ],
      lista: [
        "Nada de claves, contraseñas ni datos de clientes en el chat. Si se te escapó una clave, revocala.",
        "Probá el código antes de usarlo: que compile, que pasen los tests, que entiendas cada línea.",
        "Pedile la documentación oficial de cada función que usó, y fijate que exista.",
        "Una web, un PDF o un correo pueden traer **prompt injection**: si quiere hacer algo que no pediste, no lo apruebes.",
        "Instalá solo los plugins que usás, y no actives \"Always allow\" en chats con contenido ajeno.",
        "En Work, dale la carpeta mínima y mantené la aprobación de acciones hasta conocer bien la tarea.",
        "La clave de la API va en `OPENAI_API_KEY` y en `.gitignore` lo que la guarde (por ejemplo `.env`).",
      ],
    },
    {
      heading: "Errores comunes",
      parrafos: ["Los que más se repiten, y cómo evitarlos:"],
      lista: [
        "Pegar \"no anda\" sin el error: sin el **mensaje completo** solo puede adivinar.",
        "Copiar el código sin leerlo y descubrir semanas después una función que no existe.",
        "Confiar en la memoria para reglas importantes: puede no estar. Van en instrucciones.",
        "Chats eternos que mezclan tres temas: abrí uno nuevo con un resumen.",
        "Pensar que el plan de ChatGPT incluye la API: son cuentas y cobros separados.",
        "Bajar la app de escritorio desde un link de un buscador en vez de chatgpt.com/download.",
        "Usar Chat para cambiar un repo entero: para eso está Codex, que ve los archivos y corre los tests.",
        "Pedirle la tarea resuelta y entregar algo que no podés explicar.",
      ],
    },
    {
      heading: "Comparación con Claude Code y Codex",
      parrafos: [
        "La diferencia grande no es la marca, es el tipo de herramienta: ChatGPT en Chat es un **asistente que conversa**; Claude Code y Codex son **agentes** que trabajan dentro de tu proyecto con permisos.",
      ],
      tabla: {
        cabeza: ["", "ChatGPT", "Claude Code", "Codex"],
        filas: [
          ["Quién lo hace", "OpenAI", "Anthropic", "OpenAI"],
          ["Qué es", "Asistente de chat (más Work para entregables)", "Agente de programación", "Agente de programación"],
          ["Dónde corre", "Web, escritorio, celular", "Terminal, IDE, escritorio, web", "Terminal, IDE, app de ChatGPT, nube"],
          ["Toca tu repo", "No en Chat: copiás y probás vos", "Sí, con permisos", "Sí, con sandbox y aprobación"],
          ["Contexto fijo", "Instrucciones personalizadas y de proyecto", "`CLAUDE.md`", "`AGENTS.md`"],
          ["Cuenta", "Cualquier plan de ChatGPT, incluso Free", "Plan pago de Claude o clave de API", "Planes de ChatGPT o clave de API"],
          ["Para qué conviene", "Entender, aprender, borradores, depurar de a poco", "Cambios en un repo con tests", "Cambios en un repo, tareas en la nube"],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Armá un proyecto para lo que estés aprendiendo, con instrucciones cortas, y usá el modo de estudio o el prompt de profesor para tus ejercicios. Cuando quieras que una IA trabaje directo sobre tu código, pasá al tema de Codex (o al de Claude Code).",
        "Si querés programar con los modelos, hacé el ejemplo mínimo de la API y seguí con la guía rápida oficial. Como los modelos y los planes cambian seguido, la fuente confiable es la **documentación oficial**: help.openai.com para ChatGPT y developers.openai.com para la API.",
      ],
    },
  ],
  fuentes: [
    { texto: "Descargas de ChatGPT (escritorio y móvil)", url: "https://chatgpt.com/download/" },
    { texto: "App de escritorio de ChatGPT", url: "https://learn.chatgpt.com/codex/app" },
    { texto: "Instalación en Windows", url: "https://learn.chatgpt.com/codex/app/windows" },
    { texto: "App de escritorio para Linux (preview)", url: "https://learn.chatgpt.com/docs/linux/linux-app" },
    { texto: "Primeros pasos con la app (barra lateral, Chat y Work)", url: "https://learn.chatgpt.com/codex/quickstart?setup=app" },
    { texto: "Atajos de teclado de la app", url: "https://learn.chatgpt.com/codex/app/commands" },
    { texto: "Chat, Work y Codex", url: "https://learn.chatgpt.com/codex/get-started-with-work" },
    { texto: "Planes de ChatGPT", url: "https://chatgpt.com/pricing/" },
    { texto: "GPT-6 y otros modelos en ChatGPT", url: "https://help.openai.com/en/articles/20001354-gpt-6-and-other-models-in-chatgpt" },
    { texto: "Modelos (Astra, Sol, Terra, Luna)", url: "https://learn.chatgpt.com/codex/models" },
    { texto: "Elegir modelo", url: "https://learn.chatgpt.com/codex/model-selection" },
    { texto: "Proyectos y chats", url: "https://learn.chatgpt.com/codex/projects" },
    { texto: "Memoria", url: "https://learn.chatgpt.com/codex/customization/memories" },
    { texto: "Personalizar ChatGPT", url: "https://learn.chatgpt.com/codex/personalize" },
    { texto: "Búsqueda web", url: "https://learn.chatgpt.com/codex/web-search" },
    { texto: "Plugins", url: "https://learn.chatgpt.com/codex/plugins" },
    { texto: "Migrar GPTs a plugins", url: "https://learn.chatgpt.com/codex/migrate-custom-gpts" },
    { texto: "Controles de datos en ChatGPT", url: "https://help.openai.com/articles/7730893-data-controls-in-chatgpt" },
    { texto: "Análisis de datos con ChatGPT", url: "https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt" },
    { texto: "Modo de estudio (julio de 2025)", url: "https://openai.com/index/chatgpt-study-mode/" },
    { texto: "Guía rápida de la API", url: "https://developers.openai.com/api/docs/quickstart" },
    { texto: "Tus datos en la API", url: "https://developers.openai.com/api/docs/guides/your-data" },
    { texto: "Prompt engineering", url: "https://developers.openai.com/api/docs/guides/prompt-engineering" },
  ],
  revisada: "2026-11-14",
};
