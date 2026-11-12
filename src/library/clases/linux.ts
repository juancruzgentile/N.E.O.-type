import { type Clase, code } from "../types";

export const claseLinux: Clase = {
  titulo: "Linux de cero: el sistema operativo debajo de casi todo servidor",
  bajada:
    "Qué es Linux (y qué no es), cómo se organiza por dentro, tus primeros comandos, los conceptos de archivos, permisos y procesos, " +
    "los errores que borran cosas sin vuelta atrás y cuándo conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Linux es un sistema operativo de código abierto de la familia Unix. Hablando con precisión, \"Linux\" es el kernel (el núcleo que administra la memoria, los procesos y el hardware); lo que se instala se llama distribución (Ubuntu, Debian, Fedora, Arch, Mint…), que junta el kernel con las herramientas, un gestor de paquetes y un escritorio. Corre en servidores, en la nube, en teléfonos Android, en dispositivos embebidos y en computadoras personales.",
        "El problema que resuelve es el de tener un sistema potente, gratuito y modificable, que se pueda automatizar. Casi todo en Linux se maneja con comandos y archivos de texto, lo que permite escribir scripts, administrar cientos de servidores a la vez y reproducir un entorno idéntico. Si programás, vas a encontrar Linux en tu servidor, en tu contenedor y en tu sistema de integración continua.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Unix nació en los laboratorios Bell en 1969. En 1983, Richard Stallman lanzó el proyecto GNU para crear un sistema libre; tenía casi todas las herramientas pero le faltaba un kernel. En 1991, el estudiante finlandés Linus Torvalds publicó el suyo, Linux, y combinado con las herramientas de GNU formó un sistema completo. Por eso algunos lo llaman GNU/Linux.",
      ],
      lista: [
        "Desde los años noventa aparecieron las distribuciones: Debian (1993), Red Hat, Ubuntu (2004)…",
        "Linux se volvió la base de internet: la mayoría de los servidores web, de la nube y de los supercomputadores lo usan.",
        "Android usa el kernel Linux; así que está en miles de millones de teléfonos.",
        "El desarrollo del kernel lo coordinan miles de personas y empresas, y lo supervisa Torvalds.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "La filosofía heredada de Unix se resume en tres ideas. Todo es un archivo: los documentos, los discos, los dispositivos y hasta los procesos se exponen como archivos o carpetas. Cada herramienta hace una sola cosa bien: ls lista, grep busca, sort ordena. Y las herramientas se combinan con tuberías (pipes): la salida de un comando es la entrada del siguiente.",
        "El sistema de archivos es un único árbol que empieza en la raíz (/). /home guarda las carpetas de los usuarios, /etc las configuraciones, /var los datos que cambian (registros, bases), /usr los programas y /tmp los temporales. Cada archivo tiene un dueño, un grupo y permisos de lectura, escritura y ejecución para el dueño, el grupo y el resto. El usuario root puede todo, por eso se evita usarlo directamente y se usa sudo para ejecutar con privilegios solo lo necesario.",
      ],
    },
    {
      heading: "Tus primeros comandos, paso a paso",
      parrafos: [
        "Abrí una terminal y probá. Cada línea es un comando; lo que sigue a # es un comentario.",
      ],
      codigo: [
        code`
pwd                          # dónde estoy
ls -la                       # qué hay acá (incluye archivos ocultos)
mkdir proyectos && cd proyectos
echo "hola" > saludo.txt     # crea un archivo con ese texto
cat saludo.txt               # lo muestra
cp saludo.txt copia.txt
mv copia.txt viejo.txt
rm viejo.txt

# combinar comandos con una tubería: las 5 notas más altas de un archivo
sort -rn notas.txt | head -5

# buscar texto en todos los archivos
grep -rn "TODO" .`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "pwd muestra el directorio actual y ls -la lista el contenido en formato largo, con permisos y dueños. mkdir crea una carpeta y cd entra en ella; el && ejecuta el segundo comando solo si el primero salió bien. El > redirige la salida de echo a un archivo (si ya existía, lo pisa; con >> se agrega al final).",
        "La tubería | conecta comandos sin archivos intermedios: lo que imprime uno entra al siguiente. Con grep -rn buscás un texto de forma recursiva (-r) mostrando el número de línea (-n). La ayuda de cualquier comando está en man comando, y casi todos aceptan --help.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco te manejás en cualquier servidor:",
      ],
      lista: [
        "Archivos y rutas: absolutas (/home/ana/notas.txt) y relativas (../notas.txt). ~ es tu carpeta personal.",
        "Permisos: rwx para dueño, grupo y otros. chmod los cambia y chown cambia el dueño.",
        "Procesos: ps y top los muestran, kill los termina, & lanza uno en segundo plano.",
        "Redirecciones y tuberías: >, >>, < y | conectan comandos y archivos.",
        "Paquetes y servicios: el gestor de paquetes (apt, dnf, pacman) instala software, y systemctl controla los servicios.",
      ],
      codigo: [
        code`
ls -l script.sh                 # -rw-r--r-- 1 ana ana ... script.sh
chmod +x script.sh              # permiso de ejecución
./script.sh

ps aux | grep nginx             # procesos de nginx
sudo systemctl restart nginx    # reiniciar un servicio
sudo apt install htop           # instalar un paquete (Debian y Ubuntu)

tail -f /var/log/syslog         # seguir un registro en vivo`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "En la terminal no hay papelera ni deshacer:",
      ],
      lista: [
        "rm -rf sin pensar: borra sin preguntar y sin recuperación. Revisá la ruta dos veces; probá primero con ls. Nunca lo uses con una variable que podría estar vacía.",
        "Usar sudo para todo: un comando equivocado con privilegios de administrador puede romper el sistema. Usalo solo cuando hace falta.",
        "chmod 777: da permisos totales a cualquiera. Casi siempre hay una solución mejor (corregir el dueño o dar el permiso justo).",
        "Rutas con espacios sin comillas: rm Mis Documentos se interpreta como dos archivos distintos. Poné la ruta entre comillas.",
        "Copiar comandos de internet sin leerlos: sobre todo los que bajan un script y lo ejecutan directamente.",
        "Confundir > con >>: > pisa el archivo, >> agrega al final.",
        "Editar archivos del sistema sin copia: copiá el original antes (cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak).",
      ],
      codigo: [
        code`
ruta=""
rm -rf "$ruta/"*          # PELIGRO: con la variable vacía, esto borra desde la raíz

# más seguro: fallar si la variable está vacía
rm -rf "\${ruta:?variable vacía}/"*

rm Mis Documentos          # se interpreta como dos archivos: Mis y Documentos
rm "Mis Documentos"        # con comillas es uno solo`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "Linux es líder en servidores y menos común en el escritorio:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Linux?", "Por qué"],
        filas: [
          ["Servidores y la nube", "Sí", "Estable, ligero, gratuito y automatizable."],
          ["Contenedores (Docker, Kubernetes)", "Sí", "Los contenedores usan funciones del kernel Linux."],
          ["Desarrollo de software", "Sí", "Las herramientas de desarrollo son nativas; en Windows se usa WSL."],
          ["Sistemas embebidos y dispositivos", "Sí", "Se adapta a casi cualquier hardware."],
          ["Escritorio con programas de oficina específicos o juegos", "A veces", "Cada vez mejor, pero algunos programas solo existen en Windows o macOS."],
          ["Software de diseño profesional con licencias específicas", "No siempre", "Muchos no tienen versión para Linux."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de Linux cuando…"],
        filas: [
          ["Windows", "usás programas que solo existen allí o administrás un entorno de Microsoft."],
          ["macOS", "desarrollás para iPhone y Mac; es un sistema Unix, así que los comandos te resultarán familiares."],
          ["BSD (FreeBSD, OpenBSD)", "querés un sistema con otra filosofía de licencia o un enfoque especial de seguridad."],
          ["WSL", "estás en Windows y necesitás entorno Linux para desarrollar sin cambiar de sistema."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de Linux de la app y usá la pestaña Referencia para recordar los comandos. Para practicar, instalá una distribución en una máquina virtual (Ubuntu o Debian), y proponete tareas reales: organizar archivos, buscar texto en un proyecto, instalar y configurar un servidor web.",
        "El manual del propio sistema (man) es la fuente más confiable, y The Linux Command Line, de William Shotts, es un libro gratuito muy bueno. Antes de ejecutar algo que no conocés, leelo.",
      ],
    },
  ],
  fuentes: [
    { texto: "The Linux Command Line (libro gratuito)", url: "https://linuxcommand.org/tlcl.php" },
    { texto: "Documentación del kernel Linux", url: "https://docs.kernel.org/" },
    { texto: "GNU Coreutils: manual", url: "https://www.gnu.org/software/coreutils/manual/" },
  ],
  revisada: "2026-11-12",
};
