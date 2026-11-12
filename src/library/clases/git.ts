import { type Clase, code } from "../types";

export const claseGit: Clase = {
  titulo: "Git de cero: el historial de tu proyecto, sin miedo a romper nada",
  bajada:
    "Qué es Git y cómo guarda tu proyecto por dentro, tu primer repositorio, ramas y fusiones, el trabajo con GitHub, " +
    "los errores que parecen irreversibles (casi nunca lo son) y cuándo conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Git es un sistema de control de versiones distribuido: guarda el historial completo de los cambios de un proyecto, con quién hizo cada uno, cuándo y por qué. Permite volver a cualquier punto anterior, trabajar en varias cosas a la vez en ramas separadas y combinar el trabajo de muchas personas sin pisarse.",
        "El problema que resuelve es el del caos de las copias: proyecto_final.zip, proyecto_final_2.zip, proyecto_final_de_verdad.zip. Con Git hay una sola carpeta y un historial; podés probar algo arriesgado en una rama y descartarlo, ver qué cambió hace tres meses, o encontrar el cambio que introdujo un error. Es la herramienta que usan casi todos los equipos de software.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo creó Linus Torvalds en 2005, en pocas semanas, porque el proyecto del kernel Linux había perdido el acceso gratuito a la herramienta que usaba (BitKeeper) y ninguna alternativa era lo bastante rápida ni distribuida. Los objetivos: velocidad, un diseño simple, soporte de miles de ramas en paralelo y que cada copia tenga todo el historial.",
        "GitHub (2008) lo hizo masivo al agregar una forma cómoda de compartir y revisar código (los pull requests), y después aparecieron GitLab, Bitbucket y otros. Hoy Git es el estándar de facto.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "Git no guarda diferencias entre versiones: guarda instantáneas del proyecto. Todo se almacena como objetos identificados por un hash del contenido. Un blob es el contenido de un archivo, un tree es una carpeta (lista de blobs y otros trees) y un commit apunta a un tree y a su commit anterior (el padre), con autor, fecha y mensaje. Como cada objeto se identifica por su contenido, nada se modifica una vez guardado, y cualquier corrupción se detecta.",
        "Una rama no es una copia: es solo una etiqueta (un puntero) que señala un commit, y se mueve cuando hacés uno nuevo. Por eso crear ramas es instantáneo. HEAD indica en qué commit estás. Y existe una zona intermedia, el área de preparación (staging o index), donde armás qué cambios van en el próximo commit.",
      ],
    },
    {
      heading: "Tu primer repositorio, paso a paso",
      parrafos: [
        "Con Git instalado, en una carpeta nueva:",
      ],
      codigo: [
        code`
git config --global user.name "Ana"
git config --global user.email "ana@ejemplo.com"

git init
echo "# Mi proyecto" > README.md
git status                   # README.md aparece como archivo sin seguimiento

git add README.md            # lo preparo para el commit
git commit -m "Agrego el README"
git log --oneline            # el historial`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "git config guarda tu nombre y correo, que quedan en cada commit. git init crea la carpeta oculta .git, donde vive todo el historial. git status te dice en qué estado está cada archivo: sin seguimiento, modificado o preparado.",
        "El ciclo de trabajo siempre es el mismo: editás archivos, los preparás con git add (elegís qué entra en el próximo commit) y los confirmás con git commit con un mensaje que explique el porqué del cambio. Los commits chicos y con un mensaje claro hacen que el historial sirva.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco trabajás en equipo sin problemas:",
      ],
      lista: [
        "Commits: instantáneas con mensaje. Chicos, frecuentes y con un propósito.",
        "Ramas: una línea de trabajo independiente. Se crea una por tarea y se fusiona cuando termina.",
        "Fusionar (merge) y rebase: dos formas de integrar el trabajo de una rama en otra. Merge conserva el historial tal cual; rebase lo reescribe para que quede lineal.",
        "Remotos: copias del repositorio en otro lugar (GitHub). push envía tus commits, pull trae los de otros.",
        "Pull request: una propuesta de cambio para que otros la revisen antes de fusionarla.",
      ],
      codigo: [
        code`
git switch -c arreglo-login          # nueva rama
# ... editar, git add, git commit ...

git switch main
git merge arreglo-login              # traigo el trabajo a main

git remote add origin https://github.com/ana/proyecto.git
git push -u origin main              # subo mi historial
git pull                             # traigo lo de los demás

git restore archivo.txt              # descarto cambios sin confirmar
git revert 3f2a1c                    # deshago un commit con otro commit nuevo`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Casi todos tienen arreglo, y casi todos se evitan:",
      ],
      lista: [
        "Subir secretos: una clave o un .env que entra a un commit queda en el historial para siempre, aunque lo borres después. Hay que rotar la clave. Usá .gitignore desde el primer día.",
        "git push --force sobre una rama compartida: pisa el trabajo de otros. Usá --force-with-lease y solo en tus ramas.",
        "Commits enormes con mensajes como \"cambios\": el historial no sirve para entender ni para volver atrás.",
        "Trabajar directo en main: crear una rama por tarea facilita revisar y deshacer.",
        "Subir archivos grandes o generados (node_modules, builds): hacen pesado el repositorio. Ponelos en .gitignore.",
        "Entrar en pánico por un HEAD desacoplado: simplemente estás parado en un commit sin rama; creá una rama (git switch -c nombre) y seguí.",
        "Creer que perdiste el trabajo: casi siempre sigue ahí. git reflog muestra dónde estuvo HEAD y permite recuperar commits que parecían borrados.",
      ],
      codigo: [
        code`
git reset --hard HEAD~1       # PELIGRO: descarta el último commit y los cambios sin guardar

git reflog                    # pero el commit sigue en el registro
# 3f2a1c HEAD@{1}: commit: Agrego el login
git reset --hard 3f2a1c       # lo recupero

echo ".env" >> .gitignore      # que los secretos nunca entren
echo "node_modules/" >> .gitignore`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "Git es ideal para texto, y menos para archivos binarios grandes:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Git?", "Por qué"],
        filas: [
          ["Código fuente de cualquier proyecto", "Sí", "Para esto fue creado."],
          ["Documentación, configuración y sitios estáticos", "Sí", "Es texto y se beneficia del historial y de las revisiones."],
          ["Trabajo en equipo con revisiones", "Sí", "Ramas y pull requests ordenan la colaboración."],
          ["Tus propios apuntes y scripts", "Sí", "Un historial gratis y una copia remota de respaldo."],
          ["Videos, imágenes y modelos muy pesados", "Con Git LFS", "Los binarios grandes inflan el repositorio; LFS guarda solo punteros."],
          ["Secretos y datos de producción", "No", "No pertenecen a un repositorio, ni siquiera a uno privado."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de Git cuando…"],
        filas: [
          ["Subversion (SVN)", "un sistema heredado de tu empresa lo exige."],
          ["Mercurial", "tu proyecto ya lo usa; el modelo es parecido, con menos comandos."],
          ["Jujutsu (jj)", "querés una interfaz más simple sobre repositorios Git."],
          ["Un almacenamiento de archivos con versiones (Drive, S3)", "tu contenido son documentos o archivos grandes, no código."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de Git de la app y usá la pestaña Referencia para recordar los comandos. Para practicar, creá un repositorio de prueba y provocá a propósito los líos: un conflicto de fusión, un commit equivocado, un reset del que te recuperás con el reflog. Perderle el miedo a Git es lo que más cambia cómo trabajás.",
        "El libro Pro Git, gratuito y en español, es la referencia completa. Para practicar ramas de forma visual hay sitios interactivos de aprendizaje, y GitHub tiene guías para colaborar con pull requests.",
      ],
    },
  ],
  fuentes: [
    { texto: "Pro Git (libro oficial)", url: "https://git-scm.com/book/es/v2" },
    { texto: "Documentación de Git", url: "https://git-scm.com/docs" },
    { texto: "GitHub: guías de colaboración", url: "https://docs.github.com/es/pull-requests" },
  ],
  revisada: "2026-11-12",
};
