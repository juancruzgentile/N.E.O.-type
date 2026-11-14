# Changelog

Todos los cambios relevantes del proyecto. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el versionado sigue [SemVer](https://semver.org/lang/es/).

## [Sin publicar]

### Agregado
- Tema nuevo en IA: **ChatGPT**, visto desde quien programa: apps, planes, modelos, proyectos, memoria, cómo pedir código y
  depurar, cómo aprender sin que te haga la tarea, privacidad y la API de OpenAI. 29 ejemplos con fuente y una clase completa
  con cómo se ve la app. Sale de Próximamente.
- Tema nuevo en IA: **Gemini** (Gemini CLI 0.68 y los modelos de Google). 28 ejemplos con fuente (instalación, cuentas y
  claves, comandos, GEMINI.md, settings.json, extensiones, MCP, sandbox, modo no interactivo y CI) y una clase completa con cómo
  se ven la CLI y Code Assist en VS Code. Aclara que las cuentas personales pasaron a Antigravity CLI. Sale de Próximamente.
- Tema nuevo en IA: **Hermes** (Hermes Agent 0.23), el agente de código abierto de Nous Research con memoria entre sesiones
  y skills que aprende solo. 31 ejemplos con fuente (instalación, proveedores, memoria, skills, configuración, herramientas,
  MCP, permisos, integraciones) y una clase completa con cómo se ven la terminal y la app. Sale de Próximamente.
- **Claude** tiene su clase completa, armada con los cursos de Anthropic Academy y comprobada en la documentación: modelos,
  superficies, CLAUDE.md, modos de permisos, hooks, skills, subagentes, plugins, MCP y cómo se ven Claude Code y la app de
  escritorio. Actualizo cuatro ejemplos: el plan Ultra, los límites de uso, el modo auto como inicio y qué pregunta cada modo.
- Tema nuevo en IA: **Antigravity** (app 2.32 y CLI `agy`), el entorno de Google para trabajar con agentes. 25 ejemplos
  con fuente (instalación, proyectos, reglas y skills, settings.json, modelos, permisos, navegador, MCP, `agy -p` en CI) y una
  clase completa con cómo se ven la CLI y la app. Sale de Próximamente.
- Tema nuevo en IA: **OpenCode** (2.3.0), el agente de código abierto que funciona con modelos de muchos proveedores.
  30 ejemplos con fuente (instalación, proveedores, agentes build y plan, AGENTS.md, opencode.json, permisos, MCP, `opencode run`)
  y una clase completa con cómo se ven la terminal y la app de escritorio. Sale de Próximamente.
- Las clases de la Biblioteca resaltan los conceptos clave (en negrita, subrayados con el color del tema) y muestran
  el código en línea con letra de código. Los títulos de cada sección son más grandes y quedan separados por una línea.
- Las clases de IA muestran cómo se ve cada herramienta: la pantalla de la CLI o los paneles de la app, recreados con
  texto (pesan poco y se leen en cualquier tema). Empieza Codex, con su pantalla de la versión 0.169.0.
- Cuatro temas nuevos en la Biblioteca, de 12 ejemplos con fuente y una clase completa cada uno: **Cómo funciona la web**
  (DNS, TCP, TLS y HTTP, con curl, dig y openssl; también CORS y cookies), **APIs** (consumir con fetch, diseñar con REST,
  errores, idempotencia, límites, webhooks y GraphQL), **Testing** (pytest: fixtures, parametrización, dobles de prueba y
  pruebas de integración) y **Docker y despliegue** (imágenes, volúmenes, Compose, varias etapas y seguridad).
- Clases completas de **HTML**, **CSS**, **Formatos de datos**, **Linux** y **Git**, con la misma plantilla que las de los
  lenguajes: cómo procesa el navegador el HTML, la cascada y el modelo de caja, las trampas de JSON y YAML, la filosofía
  de Unix, y cómo guarda Git un proyecto por dentro, con errores típicos y tablas de cuándo conviene cada uno.
- Cuatro temas más en el grupo **Bases de datos**, de 12 ejemplos con fuente cada uno y una clase completa: **Bases de datos
  vectoriales** (embeddings, HNSW e IVF, RAG, con ejemplos de pgvector), **Procesos asíncronos y colas** (asyncio, Celery,
  RabbitMQ, Kafka, reintentos, idempotencia y el patrón outbox), **Almacenamiento y copias de seguridad** (bloques, archivos
  y objetos, S3, la regla 3-2-1 y probar la restauración) y **Seguridad de los datos** (inyección SQL, permisos mínimos,
  contraseñas, seguridad por fila, cifrado y auditoría).
- Un grupo nuevo en la Biblioteca, **Bases de datos**, con cuatro temas de 12 ejemplos cada uno (todos con su fuente
  oficial) y una clase completa: **Elegir una base de datos** (modelos, ACID, CAP y cómo decidir), **PostgreSQL** a fondo
  (MVCC, WAL, jsonb, índices, EXPLAIN, vacuum, particionado), **MongoDB** (modelado de documentos, agregación, índices,
  transacciones) y **Redis** (estructuras, caché, contadores, streams, persistencia). Las clases ahora pueden mostrar un
  ejemplo de código en otro lenguaje distinto al del tema.
- Clases completas de **ASP.NET Core**, **SwiftUI**, **Jetpack Compose** y **Laravel**, en la sección oculta de Frameworks: qué
  problema resuelve cada uno, historia, cómo funciona por dentro (el pipeline de middleware, vistas como descripción del
  estado, composición y recomposición, el camino de un pedido en Laravel), primer proyecto explicado, conceptos base, errores
  típicos y cuándo conviene usarlos.
- Clases completas de **React**, **FastAPI**, **Django** y **Spring Boot**, dentro de la sección oculta de Frameworks, con la
  misma plantilla que las de los lenguajes: qué problema resuelve, historia, cómo funciona por dentro (reconciliación y estado,
  validación por tipos, el camino de un pedido, el contenedor de inyección), primer proyecto explicado, conceptos base, errores
  típicos, y cuándo conviene usarlos.
- Clases completas de **Kotlin**, **PHP** y **SQL** en la Biblioteca, con la misma plantilla: qué es, historia, cómo funciona por
  dentro (corrutinas, el modelo de un pedido por programa de PHP, el plan y el orden lógico de una consulta SQL), primer
  programa explicado, conceptos base, errores típicos (incluidos la inyección SQL y el XSS) y tablas de dónde conviene usarlos.
- Clases completas de **C**, **C++** y **Swift** en la Biblioteca, con la misma plantilla: qué es, historia, cómo funciona por
  dentro (las etapas de compilación y la memoria en C, RAII en C++, ARC y los tipos por valor en Swift), primer programa
  explicado, conceptos base, errores típicos y tablas de dónde conviene usarlo.
- Clases completas de **C#**, **Go** y **Rust** en la Biblioteca, con la misma plantilla: qué es, historia, cómo corre por dentro
  (el CLR y LINQ perezoso, goroutines y canales, propiedad y préstamos), primer programa explicado, conceptos base, errores
  típicos, y tablas de dónde conviene usarlo y comparación con otros lenguajes.
- Clases completas de **JavaScript**, **TypeScript** y **Java** en la Biblioteca, con la misma plantilla que la de Python: qué
  es, historia, cómo funciona por dentro (el bucle de eventos, el borrado de tipos y la JVM), primer programa explicado, cinco
  conceptos base, errores típicos, tablas de dónde conviene usarlo y comparación con otros lenguajes.
- Las clases de la Biblioteca ahora pueden llevar **listas, ejemplos de código resaltado, tablas y fuentes con fecha de
  revisión**, y la pestaña se llama "Clase" (la de Codex sigue siendo "Día de trabajo"). Con esto empieza una serie de clases
  completas para cada lenguaje, framework y base de datos. La primera es la de **Python**: qué es, historia, cómo corre por
  dentro (bytecode, memoria y el GIL), un primer programa explicado línea por línea, los cinco conceptos base, los errores
  típicos, una tabla de dónde conviene usarlo y dónde no, y la comparación con otros lenguajes.
- **Claude** en la Biblioteca, en un grupo nuevo "IA" (sale de Próximamente). 35 entradas con su fuente oficial: comandos de
  `/`, opciones de la terminal, atajos, planes y límites de uso (sin precios), los cuatro modelos y cómo combinarlos, modo plan,
  modos de permisos y auto mode, `CLAUDE.md` y `AGENTS.md`, hooks, skills, agentes, MCP, plugins, el Agent SDK, y los conceptos
  de harness, capa de orquestación y RAG. Arriba de todo lleva un aviso rojo con recomendaciones de seguridad y de uso
  responsable. Tiene su logo y la mascota de Claude Code en un recuadro estilo terminal.
- **Codex** en la Biblioteca, en el mismo grupo "IA" que Claude (sale de Próximamente). 31 entradas con su fuente oficial:
  instalar y actualizar, comandos de `/`, modos de aprobación y sandbox, `config.toml` y `AGENTS.md`, MCP, el SDK y el
  app server, las cuatro plataformas (CLI, extensión de IDE, ChatGPT, Codex Cloud y GitHub), modelos y planes, y una
  comparación punto por punto con Claude Code. Tiene el mismo tipo de aviso rojo de seguridad arriba, y su propio logo
  y mascota. Además, una pestaña nueva **"Día de trabajo"**: una clase completa, en 10 secciones y con 4 diagramas en
  SVG dibujados a mano, sobre qué es la inteligencia artificial y el machine learning, cómo aprende una red neuronal,
  cómo se entrena un modelo, qué es un prompt y cómo armar uno bueno, y el bucle de trabajo de un agente — todo aplicado
  a usar Codex en la práctica.
- Cuatro proyectos con un framework: una **lista de tareas con React**, un **blog con Django**, una **API de libros con
  Spring Boot** y una **API de tareas con ASP.NET Core**. Se abren con el proyecto de su lenguaje (el de TypeScript, el
  de SQLite, el de reservas en Java y el gestor de notas en C#), así que el tablero full stack sigue abriéndose con el
  acortador de enlaces. Ahora hay 21 proyectos.
- Los frameworks de la sección oculta (React, FastAPI, Django, Spring Boot y ASP.NET Core) se abren con la ruta de su
  lenguaje **y el proyecto de ese framework**: ya no alcanza con cualquier proyecto en el lenguaje. FastAPI se abre con
  cualquiera de sus tres proyectos. Lo que ya tenías abierto no se pierde: la primera vez que entrás se guarda y queda
  abierto para siempre, y lo que ganás de ahora en adelante también se guarda.
- Tres proyectos de nivel medio, uno por lenguaje que todavía no tenía: un **conversor de unidades** en Swift, una
  **biblioteca de préstamos** en Kotlin y un **mini router de URLs** en PHP. Se abren al terminar el contador de
  palabras y entre ellos en ese orden; el de SQLite sigue abriéndose con el contador, así que nadie queda bloqueado.
  Ahora hay 17 proyectos.
- Tres frameworks nuevos en la sección oculta: **SwiftUI**, **Jetpack Compose** y **Laravel**, con 12 ejemplos cada uno,
  su fuente y su revisión. Cada uno se abre con la ruta de su lenguaje y su proyecto (el conversor, la biblioteca o
  el router); el proyecto de otro lenguaje no alcanza.
- **Entrevistas**: una sección nueva, con entrada propia en el menú. Tiene casi 300 preguntas (los 12 lenguajes, SQL, HTML,
  CSS, terminal, Git, algoritmos y conducta), cada una con explicación y fuente, y tres partes: el **banco** para
  estudiar con buscador y filtros, la **práctica** con corrección al instante y la **entrevista simulada**, con puesto,
  lenguaje, nivel y duración de 15, 30 o 45 minutos. La entrevista tiene reloj, no da pistas ni deja volver atrás, y
  la corrección llega al final en un informe con la nota, el resultado por área y las preguntas para repasar. Se guardan
  tus entrevistas para comparar. Lo que fallás entra a un repaso espaciado propio (1, 3, 7, 15 y 30 días). Salir a mitad de
  una entrevista pide confirmar. `npm run test:preguntas` revisa el banco y corre de verdad las preguntas de «¿qué imprime?».
- Menú principal: la pantalla de inicio ahora es un menú (Continuar, Lenguajes, Desafíos y proyectos, Biblioteca,
  Ajustes). El botón **Menú** de la cabecera vuelve a él desde cualquier sección, después de confirmar en un diálogo
  (Enter confirma, Esc cancela). Al volver desde la app, el menú aparece al instante con el foco en Continuar.
- **Proyectos** (en Desafíos): 10 programas completos para escribir de punta a punta en el menor tiempo posible,
  de una calculadora en Python hasta un tablero de tareas full stack con Makefile, Docker Compose, SQL, FastAPI,
  HTML, CSS y TypeScript. Cada uno se desbloquea al terminar el anterior. Las sangrías se escriben: Tab avanza
  hasta el próximo nivel (o escribe una tabulación real en Go y Makefile) y también valen los espacios. El reloj
  cuenta solo el tiempo activo (Esc pausa), los errores no avanzan y se guarda el mejor tiempo de cada proyecto.
  Salir o reiniciar a mitad de un proyecto pide confirmación.
- **Biblioteca**: referencia rápida de 13 temas (Python, JavaScript, TypeScript, Java, C#, Go, Rust,
  SQL y MongoDB, HTML, CSS, formatos de datos, terminal Linux y Git). Cada tema tiene un resumen, datos rápidos,
  métodos de trabajo y más de 250 comandos y conceptos en niveles básico, intermedio y avanzado, con ejemplos
  resaltados. La búsqueda recorre todo a la vez, sin importar acentos ni mayúsculas (/ o Ctrl+K para buscar,
  Enter abre el primer resultado). Incluye una sección **Próximamente** con IA: conceptos, Claude, ChatGPT,
  Gemini, Codex, Cursor, OpenCode, Antigravity y Hermes. También está en el menú principal.
- **Practicar y repasar**: cada entrada de la Biblioteca tiene un botón **Practicar este ejemplo** que abre una
  lección corta con su código (sin tildes ni tabulaciones, para que se pueda escribir con cualquier teclado). Al
  terminarla entra en el repaso espaciado, con un sistema de cajas: un buen intento (95 % de precisión o más) la sube
  de caja y tarda más en volver (1, 3, 7, 15 y 30 días); uno malo la devuelve al día siguiente. Lo que toca repasar
  aparece intercalado cada 2 a 4 lecciones, marcado como REPASO y priorizando el lenguaje que estás practicando. Los
  repasos no cambian el progreso del lenguaje, pero suman a la meta diaria. Cada entrada muestra si está en repaso y
  cuándo vuelve, y se puede quitar.

- **Ejercicios de memoria** (en Desafíos): se lee una consigna y se escribe el comando o el código sin verlo. 60
  ejercicios de Git, terminal Linux, SQL, Python y JavaScript, en niveles Básico, Intermedio y Avanzado que se abren
  al completar el anterior. Valen varias respuestas. Los errores leves (espacios, comillas, orden de las opciones,
  mayúsculas en SQL, el ; final) se aceptan con un aviso. Uno grave (otro comando, otra opción, otro argumento o
  comillas dobles en un texto SQL) no deja avanzar: explica qué revisar y ofrece una pista. Con cualquier teclado hay
  al menos una respuesta que se puede escribir (por ejemplo HEAD^ además de HEAD~1).

- **Atajos de editor** (en Desafíos): 24 ejercicios en un editor simulado, 12 de Vim y 12 de VS Code, en tres niveles
  que se abren en orden. Se llega a un texto objetivo con los atajos y las teclas se cuentan contra un par: igualarlo
  da tres estrellas. Vim tiene modo normal e inserción, operadores con movimientos y objetos de texto, conteos,
  deshacer y `.`; un ejercicio de Vim termina al volver al modo normal. VS Code usa los atajos por defecto de
  Linux/Windows o de Mac (nueva opción en Ajustes), con selección, y en Linux también acepta Ctrl+Shift+Alt+↓ para
  duplicar. Los atajos que el navegador no deja practicar se listan aparte. Tab siempre saca el foco del editor.

- **C y C++** como lenguajes nuevos, con su ruta de símbolos (C empieza por `( ) ; { } = *` y C++ por
  `( ) ; { } :`), generadores de código propio (structs, punteros, qsort y archivos en C; vector, ranges, optional,
  format y clases en C++) y un tema para cada uno en la Biblioteca. El CI compila con `-Wall -Wextra -Werror`
  una muestra de lo que generan: cada concepto con cada entidad del vocabulario.
- **Swift**: ruta de símbolos (arranca con `( ) { } :`), generador de código (structs, closures con `$0`,
  opcionales, guard, async/await) y tema en la Biblioteca. El CI compila con `swiftc` una muestra de lo que genera.
- **Kotlin**: ruta de símbolos (arranca con `( ) { } : . =`), generador de código (data classes, funciones de
  una expresión, `copy`, `require`, operaciones de colección) y tema en la Biblioteca. El CI compila con `kotlinc` una muestra de lo que genera.
- **PHP**: ruta de símbolos (arranca con `( ) $ ; { } :`), generador de código (clases con propiedades promovidas,
  `fn() =>`, `match`, `<=>` y las funciones `array_*`) y tema en la Biblioteca. El CI ejecuta con PHP 8.4 una muestra de lo que genera.
- **Frameworks**, una sección oculta de la Biblioteca: no aparece en el menú ni en la búsqueda hasta que se gana.
  Cada framework se abre por su lenguaje, al terminar la ruta de ese lenguaje (con cualquier teclado) y al menos un
  proyecto que lo use. Arranca con React (TypeScript o JavaScript), FastAPI y Django (Python), Spring Boot (Java) y
  ASP.NET Core (C#). Sus ejemplos también pasan por la revisión automática y se pueden practicar y repasar como los
  demás.
- Las descripciones de los símbolos pueden cambiar según el lenguaje: en C y C++, `#` es el preprocesador y `::`,
  `->` y `&` dicen lo que significan ahí.
- **4 proyectos nuevos** antes del tablero full stack, para que la dificultad suba de a poco: un gestor de notas en
  C# (no había ninguno en C#), una API de recetas con FastAPI y sus pruebas, copias de seguridad con Bash y Makefile,
  y un acortador de enlaces con SQLite, Dockerfile y Docker Compose. El tablero pasa a ser el proyecto 14.
- `npm run test:examples`: revisa la sintaxis de los 254 ejemplos de la Biblioteca con el parser real de cada
  lenguaje (Python, TypeScript, Go, Rust, Java, C#, bash, CSS, HTML, JSON, YAML y TOML). SQL queda afuera porque
  cada motor tiene su dialecto. Cada revisor se prueba primero con un ejemplo roto, para no aprobar cualquier cosa.
- `npm run test:projects`: compila los 14 proyectos y, cuando se puede, los ejecuta o corre sus pruebas (pytest,
  `probar.sh`, el gestor de notas de punta a punta).
- El CI tiene un job nuevo, `ejemplos`, que instala Python, Go, Java, .NET y Rust y corre las dos pruebas sin
  saltear nada. Los paquetes de Python que usa van fijados con hash.

### Cambiado
- Biblioteca: cada ejemplo muestra de dónde sale (un link a la documentación oficial), desde qué versión funciona y cuándo se revisó. Los 399 links se abrieron uno por uno y se comprobó que la página y la sección existan. `npm run test:fuentes` revisa que ningún ejemplo quede sin fuente; con `FUENTES_RED=1` vuelve a abrir todos los links. Son los primeros links de la app: no hace ninguna conexión por su cuenta, solo se abren si hacés clic.
- Biblioteca: cada ejemplo avisa si es un **programa completo** (se copia a un archivo y corre tal cual) o un **fragmento**, y en los fragmentos dice qué les falta. El CI ahora también compila los programas completos de C, C++, Go, Rust y Java, no solo revisa que estén bien escritos. Con eso apareció un error: el ejemplo de funciones de C no tenía el `#include <stdio.h>`.
- Retoques estéticos: la letra de la interfaz pasa de Rajdhani a IBM Plex Sans, que se lee mejor en textos largos (Chakra Petch queda para el logo y los títulos). Los tamaños de letra bajan a una escala fija, los títulos, botones y menús van en minúscula normal y el brillo queda solo en el logo y en la línea actual del código. Saco los adornos que no informaban: el "// SYS.OK", la numeración del menú, las barritas de las métricas, las rayitas de color de los paneles, el efecto glitch al abrir una pantalla y el eslogan del perfil. Lo mismo en el resto de las pantallas: los títulos y las etiquetas de Biblioteca, Desafíos, Rutas, Estadísticas, Logros y Ajustes ya no van en mayúsculas, y los cuatro sprints dejan de competir con el proyecto en curso por el botón amarillo. Las tarjetas de lenguajes que todavía no empezaste ya no muestran ceros.
- Los proyectos van del 1 al 14. Si ya habías terminado el tablero full stack, sigue abierto y conserva tu récord.
- Saqué la frase «Escribe un mejor mañana» de la pantalla de inicio y de la cabecera.

### Corregido (auditoría de IA del 2026-11-14 sobre fce96f4)
- Cada tema puede tener su propia fecha de revisión: los temas de IA nuevos ya no dicen "revisado el 5 de noviembre".
- OpenCode: cuándo sube hasta tu carpeta personal buscando `AGENTS.md`, y que la CLI de Codex también acepta modelos
  locales (`--oss`).
- Gemini: `gemini update` no existe; se actualiza con el mismo gestor (`npm install -g @google/gemini-cli@latest`).
- Hermes: la protección de `write_file` y `patch` es de las herramientas de archivo, no un aislamiento: con el backend local
  la terminal puede leer o pisar esas rutas. `~/.ssh/config` tiene una excepción con aprobación.
- Claude: `bypassPermissions` se saltea casi todas las preguntas, pero las reglas `deny` siguen valiendo y no es un sandbox.
- Antigravity: el modo default se pide sin `--mode` (en settings.json, `"agentMode": ""`), y `plan` está entre los modos.

### Corregido (auditoría del 2026-11-14 sobre d52dd83)
- El corrector de los ejercicios de memoria ya no da por buena `ps aux && grep node` cuando se pide una tubería: `|` y
  `&&` hacen cosas distintas. El orden de las opciones sigue siendo libre.
- Docker: los ejemplos con `postgres:18` montan el volumen en `/var/lib/postgresql`, la ruta que pide la imagen desde
  la versión 18 (con la anterior, el contenedor no arranca).
- Celery: los ejemplos usan `acks_late=True` y la clase explica que, por defecto, la tarea se confirma antes de correr,
  así que una tarea cortada no se reentrega.
- Redis: el límite por minuto pone el vencimiento solo la primera vez (`EXPIRE ... NX`); antes se renovaba en cada pedido
  y el contador no se reiniciaba nunca con tráfico continuo.
- APIs: la firma del webhook compara el largo en bytes (con letras acentuadas daba error 500 en vez de 401) y los
  reintentos entienden `Retry-After` con fecha HTTP, no solo en segundos.
- MongoDB: `updateOne` sin operadores da error; el que reemplaza el documento entero es `replaceOne`.
- Codex (revisado contra la CLI 0.169.0): `codex resume` abre un selector y `--last` retoma la última, `codex fork` elige
  una sesión anterior, `codex features list` y `codex apply <TASK_ID>` llevan lo que les faltaba. `codex mcp login` queda
  solo para servidores remotos con OAuth. Separo bien aprobación y sandbox, aclaro que AGENTS.md (también el global,
  `~/.codex/AGENTS.md`) ocupa contexto y que el tope de 32 KiB es del total y configurable, sumo a Codex skills,
  subagentes y plugins en la comparación, y explico el entrenamiento posterior y que el modelo puede reconocer lo que no
  sabe. Las revisiones automáticas en GitHub hay que activarlas.

### Corregido (auditoría del 2026-11-06 sobre 52c0c98)
- El corrector de respuestas escritas ya no acepta operadores partidos con un espacio: `= >`, `= =`, `! =` o `< =`
  dejaban pasar código con error de sintaxis. Los espacios alrededor de los operadores siguen siendo libres.
- Cambiar de modo (guiado o libre) a mitad de una entrevista ahora pide confirmar, como las demás salidas.
- En la práctica de Entrevistas, una respuesta fallada entra al repaso apenas se corrige, aunque termines o cambies de
  pestaña sin pulsar Siguiente.
- Preguntas del banco con una respuesta de más o una afirmación demasiado absoluta: Rust (referencias mutables), SQL
  (índice compuesto), TypeScript (`keyof`) y Python (tuplas como claves).
- Proyectos: el inventario rechaza cantidades negativas, cero o inválidas; el tablero full stack ya no ofrece un
  `make test` sin pruebas y sus prioridades alta y baja se ven con su color; el conversor de Swift muestra bien los
  valores negativos; el blog de Django ya no manda a un 404 al guardar un borrador.

### Corregido (auditoría del 2026-11-03 sobre bd327bb)
- Biblioteca, SQL: la clave foránea ahora es una restricción aparte (`FOREIGN KEY (...) REFERENCES`). MySQL ignoraba
  sin avisar el `REFERENCES` puesto en la columna, así que el ejemplo no protegía nada ahí.
- Biblioteca, React: `useReducer` y `useMemo` se llaman dentro de un componente, como exigen las reglas de los hooks.
- Biblioteca, Django: el modelo Producto declara `stock`, que usa el ejemplo de transacciones con `F()`.
- Biblioteca, C: `fgets` puede leer solo parte de una línea larga; el ejemplo de `strtol` ahora rechaza texto sobrante
  (`12abc`) y solo mira `errno` cuando corresponde.
- Biblioteca, C++: `std::move` no mueve por sí solo, y el objeto movido queda válido pero con valor no especificado
  (no necesariamente vacío).
- Biblioteca, Rust: el ejemplo de `Option` tenía una función vacía que no compilaba; ahora busca de verdad.
- Biblioteca, ASP.NET Core: el orden de la configuración estaba mal (las variables de entorno pisan a user-secrets).
- Biblioteca, Bash: `set -e` no corta dentro de `if`, `&&` o `||`; antes se presentaba como garantía total.
- Biblioteca: faltaban `cd mi-app` (Vite) y `cd Tienda` (ASP.NET); MongoDB guarda documentos BSON, no "objetos JSON".
- Cada uno de estos errores tiene su prueba en `test:regression`.

### Corregido (auditoría del 2026-11-02 sobre 94b0fcc)
- Con la app abierta en dos ventanas, la que guardaba última borraba los cambios de la otra. Ahora las ventanas se
  avisan los cambios y, antes de guardar, se combinan clave por clave.
- Las estadísticas de lecciones, tiempo, caracteres y mejor velocidad cuentan todo el historial, no solo las
  últimas 500 lecciones.
- Practicar un ejemplo de la Biblioteca (y su repaso) respeta «Saltar símbolos sin tecla»: saltea las líneas con
  símbolos que tu teclado no tiene y avisa cuáles y cómo escribirlos.
- El diálogo de práctica y el de fin de proyecto atrapan el foco, dejan inerte el resto de la app y lo devuelven
  al cerrar.
- Biblioteca: SQLite necesita `PRAGMA foreign_keys = ON`; la CTE ya no usa `DATE '…'`; EXPLAIN, upsert, CTE y
  funciones de ventana dicen para qué motor y versión sirven. Go: `errors.Is` en quien llama y canal con búfer en el
  timeout. TypeScript: límites de `node app.ts`. C#: el código de nivel superior va antes de las clases y se precisa
  qué tan inmutable es un record. Java: `assertThrows` con una llamada real. HTML: el `dialog` trae cómo abrirlo.
  También se precisaron CSS (cascada), Python (asyncio y archivos), YAML (tabulaciones), Rust (unsafe), GitHub
  Actions (v7 y fijar por SHA) y `git reset` (stash y reflog).
- Los ejercicios de Go capitalizaban palabras cortando el primer byte, lo que rompía texto con tildes o ñ.
- Biblioteca, Java: el ejemplo de String tenía un text block suelto (`"""…""";`), que no compila; ahora se asigna
  a una variable. Lo encontró la revisión automática de ejemplos.
- Node 20 ya no figura como soportado: mínimo 22.12, recomendado una LTS con soporte (24 o 26).

## [1.6.0] - 2026-11-02

La app aprende tu teclado real y se puede calibrar desde Ajustes; logros con nombres nuevos.

### Agregado
- La app aprende tu teclado real: si escribís un símbolo con una tecla o modificadores distintos de los que
  supone la distribución elegida, lo detecta (dos veces seguidas) y desde ahí enseña tu combinación.
- Ajustes → Teclado físico → **Calibrar teclado**: te pide cada símbolo una vez y graba cómo lo escribís,
  incluidas las teclas muertas. **Restablecer** olvida lo aprendido. Se guarda por distribución y por navegador.
- `test:e2e` acepta `CHROMIUM_PATH` para usar un Chromium ya instalado.

### Cambiado
- Los 27 logros tienen nombres nuevos con humor de programador (lo que hay que hacer para ganarlos no cambia).
- `iniciar.sh` e `iniciar.bat` construyen la app si todavía no existe `NeonType.html`, en lugar de pedir que
  ejecutes primero el script de construcción.
- Dependencia de desarrollo: `playwright-core` 1.64.1.

## [1.5.0] - 2026-10-28

Tutorial de bienvenida, nombre unificado como N.E.O.-type, navegación en pantallas chicas y correcciones de las
auditorías de la v1.4.0. Detalle de cada corrección en `correcciones.txt`.

### Corregido
- "Precisión perfecta" ya no da récord con un error en el último carácter.
- Al cortar un sprint, el fallo en la posición pendiente cuenta en la precisión.
- Pegar o arrastrar texto en la práctica ya no cuenta como tecleo; Tab libera el foco.
- Las copias de seguridad se exportan en JSON compacto y los límites se miden en bytes.
- Música: pausar conserva la posición, los ajustes importados se aplican, la selección sigue a la canción
  al quitar otras y IndexedDB espera la confirmación de cada transacción.
- No se repite el concepto de la lección anterior si hay alternativa.
- El título del ejercicio de proporciones CSS coincide con el código.
- Modo calmo: corta todas las animaciones, no calcula el fondo oculto y los logros quedan visibles.
- `npm run check` falla (código 1) si encuentra problemas.
- Requisito de Node corregido a `^20.19.0 || >=22.12.0`.
- Estadísticas ya no desborda en el celular: la tabla de símbolos se desplaza dentro de su recuadro.
- Al cerrar el tutorial, el foco vuelve al área de escritura en lugar de perderse.
- El CI corre en Ubuntu 24.04, porque Playwright todavía no instala el navegador en la 26.04.

### Agregado
- Tutorial de bienvenida: mensaje inicial y recorrido de 5 pasos con foco sobre la pantalla de práctica
  (código, teclado, símbolos, métricas y menú). Aparece una sola vez, se maneja con Enter / Esc / flechas
  y se repite desde Ajustes. Quien ya tenía días de práctica no lo ve automáticamente. Los textos se adaptan
  a lenguajes, rutas Trainee y modo libre; el foco queda dentro del diálogo y en pantallas chicas solo
  resalta elementos visibles.
- Navegación compacta cuando la ventana mide menos de 1250 px (antes desaparecía el menú).

### Cambiado
- El nombre se muestra igual en toda la app y la documentación: **N.E.O.-type** (antes aparecía también
  "NeonType" en la cabecera, el pie, la pantalla de inicio, el título de la pestaña y las capturas).
  La copia de seguridad se descarga como `neo-type-progreso-AAAA-MM-DD.json`. El progreso guardado no cambia.
- Pruebas nuevas, todas en CI: `test:logic` (progreso, logros, resaltado, canciones guardadas),
  `test:regression` (errores corregidos) y `test:e2e` (la app en Chromium real con Playwright).
- `npm test` corre todas las pruebas.
- Dependencia de desarrollo: `playwright-core` 1.56.1 (sin scripts de instalación).

## [1.4.0] - 2026-10-25

### Agregado
- **Rutas Trainee**: rutas por escalones de dificultad para las herramientas de todos los días. Cada escalón suma
  temas nuevos, se mezcla con los anteriores y las lecciones se enfocan en el escalón más flojo. Un escalón se domina
  cuando las últimas 3 lecciones promedian la velocidad y la precisión objetivo.
  - **Bases de datos**: SQLite → MySQL → PostgreSQL → MongoDB, con cada consulta en el dialecto de su motor.
  - **Terminal Linux**: Ubuntu/Mint → Debian → Fedora → CachyOS → Arch Linux, con comandos propios de cada
    distribución (gestor de paquetes, nombres de paquetes y servicios, grupos, firewall, AUR).
  - **HTML**: estructura, listas y tablas, formularios, semántica y accesibilidad, head y recursos.
  - **CSS**: selectores, modelo de caja, flexbox, grid, responsive, variables y animación.
  - **Formatos**: `.env`, `requirements.txt`, JSON, `package.json`, YAML y Markdown.
- Selector de motor de base de datos y de distribución en la práctica libre.
- 5 logros nuevos para las rutas Trainee.
- Tests de seguridad para los datos de las rutas nuevas y para el script incrustado del build.

### Cambiado
- La pantalla de inicio separa los lenguajes de programación de las rutas Trainee.
- La versión que muestra la app sale de `package.json`.

### Seguridad
- El build escapa `<!--` y `<script` dentro del JavaScript incrustado antes de calcular el hash de la CSP: juntas
  pueden impedir que el navegador cierre el elemento `<script>`.

## [1.3.0] - 2026-10-25

### Agregado
- Tema **Cyber** (nuevo tema por defecto): amarillo, rojo y cian sobre negro.
- Lenguaje visual cyberpunk en todos los temas: tipografía Chakra Petch en títulos, íconos angulares, marcos con
  muescas, botones con corte diagonal, menú numerado, glitch breve al entrar a cada pantalla y líneas de escaneo
  sobre el fondo. El panel de código no cambia: sigue en JetBrains Mono y sin efectos encima.
- Insignias de logros en SVG (marco octogonal, color según el rango) en lugar de emojis.
- Emblemas de lenguaje con forma de "datashard": monograma con aberración cromática, código de barras y número de serie.
- Content Security Policy estricta en el build: solo se ejecuta el script propio (por hash SHA-256), sin conexiones
  de red, sin recursos externos y con Trusted Types obligatorios.
- Validación estricta de todos los datos que entran a la app (copias de seguridad y datos guardados).
- Límites de tamaño y formato para fotos, canciones y copias de seguridad.
- Confirmación antes de importar una copia de seguridad.
- `npm run test:security`: tests automáticos de validación de datos y de la CSP.
- CodeQL (análisis estático de seguridad) y Dependabot con 7 días de espera para nuevas versiones.
- `SECURITY.md` con la política de seguridad y cómo reportar vulnerabilidades.

### Cambiado
- Las GitHub Actions están fijadas por hash de commit y el token del workflow es de solo lectura.
- `.npmrc` con `ignore-scripts=true`: las dependencias no ejecutan código al instalarse.
- Todas las dependencias con versión exacta. Los scripts de construcción usan `npm ci`.
- Orbitron reemplazada por Chakra Petch.

## [1.2.0] - 2026-10-25

### Agregado
- Pantalla de inicio con el logo encendiéndose como un cartel de neón; la primera vez pide nombre e imagen.
- Perfil editable: foto propia (recortada a 256 px y sin metadatos) o 12 avatares prediseñados.
- Emblemas propios para cada lenguaje.
- `THIRD_PARTY_NOTICES.md` con las licencias de las dependencias y fuentes incluidas.

### Cambiado
- Música unos 17 dB más fuerte, con limitador para evitar distorsión.

## [1.1.0] - 2026-10-25

### Agregado
- Música generativa: 7 estaciones sintetizadas en vivo y opción de cargar canciones propias.
- Teclado flotante, fondo de partículas que late con la música, auroras y efectos por pulsación.
- Brillo según la racha de aciertos, ola al terminar una lección y animación al desbloquear un símbolo.
- 22 logros y 5 temas de color.
- Opción para desactivar animaciones (respeta "reducir movimiento" del sistema).

## [1.0.0] - 2026-10-25

### Agregado
- Modo guiado adaptativo con desbloqueo exigente de símbolos.
- Generador de código para Python, JavaScript, TypeScript, Java, C#, Go y Rust.
- Teclados italiano, inglés (EE. UU.), español (España) y español (Latinoamérica).
- Modo libre, desafíos (sprints y precisión perfecta) y estadísticas con mapa de calor.
- Build de un solo archivo que funciona sin conexión.

[Sin publicar]: https://github.com/juancruzgentile/N.E.O.-type/compare/v1.6.0...main
[1.6.0]: https://github.com/juancruzgentile/N.E.O.-type/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/juancruzgentile/N.E.O.-type/compare/7494b31...v1.5.0
[1.4.0]: https://github.com/juancruzgentile/N.E.O.-type/compare/32c443d...7494b31
[1.3.0]: https://github.com/juancruzgentile/N.E.O.-type/compare/e0ac0e7...32c443d
[1.2.0]: https://github.com/juancruzgentile/N.E.O.-type/compare/d7abd94...e0ac0e7
[1.1.0]: https://github.com/juancruzgentile/N.E.O.-type/compare/2242a79...d7abd94
[1.0.0]: https://github.com/juancruzgentile/N.E.O.-type/commit/2242a79
