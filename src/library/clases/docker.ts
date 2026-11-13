import { type Clase, code } from "../types";

export const claseDocker: Clase = {
  titulo: "Docker y despliegue: que funcione igual en tu máquina y en el servidor",
  bajada:
    "Qué es un contenedor (y qué no es), cómo se construye una imagen, tu primera aplicación empaquetada, Compose para varios servicios " +
    "y los errores de seguridad y de datos que más se repiten al publicar.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Docker es una herramienta para empaquetar una aplicación junto con todo lo que necesita para ejecutarse (el sistema base, las bibliotecas, la configuración) en una imagen, y ejecutarla en contenedores aislados. Un contenedor es un proceso (o un grupo de procesos) que corre aislado del resto del sistema, con su propio sistema de archivos, su propia red y recursos limitados.",
        "El problema que resuelve es el clásico \"en mi máquina funciona\". Una aplicación depende de la versión del lenguaje, de bibliotecas del sistema, de variables de entorno; si el servidor tiene algo distinto, falla. Con una imagen, lo que probaste es exactamente lo que se despliega, y cualquier persona del equipo puede levantar el proyecto completo (la aplicación, la base de datos, la caché) con un solo comando.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Docker lo presentó Solomon Hykes en 2013, dentro de la empresa dotCloud. La idea de aislar procesos ya existía en Unix (chroot, FreeBSD jails, Solaris zones, y en Linux, cgroups y namespaces); Docker la volvió fácil, con un formato de imagen portable, un archivo simple para describirla (el Dockerfile) y un sitio para compartir imágenes (Docker Hub).",
        "Se extendió con rapidez, y en 2015 se creó la Open Container Initiative para estandarizar el formato de imagen y de ejecución. Sobre los contenedores nació Kubernetes (Google, 2014), que los orquesta a gran escala. Hoy hay otras herramientas compatibles con el mismo formato, como Podman, pero los comandos y el Dockerfile son prácticamente los mismos.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "Un contenedor no es una máquina virtual. Una máquina virtual simula un equipo completo con su propio sistema operativo; un contenedor comparte el núcleo (kernel) de Linux del equipo anfitrión y se aísla con dos funciones del kernel: los namespaces (el contenedor ve solo sus propios procesos, red y archivos) y los cgroups (limitan cuánta CPU y memoria puede usar). Por eso arranca en milisegundos y ocupa muy poco.",
        "Una imagen se compone de capas de solo lectura: cada instrucción del Dockerfile agrega una. Las capas se comparten entre imágenes y se guardan en caché, de modo que reconstruir una imagen tras cambiar una línea reutiliza todo lo anterior. Al arrancar un contenedor se le agrega arriba una capa de escritura temporal: todo lo que escribe ahí desaparece al borrarlo. Por eso los datos que importan se guardan en volúmenes.",
      ],
    },
    {
      heading: "Tu primera aplicación empaquetada, paso a paso",
      parrafos: [
        "Con Docker instalado, creá una carpeta con tres archivos y construí la imagen.",
      ],
      codigo: [
        { lang: "python", text: code`
# app.py
from http.server import BaseHTTPRequestHandler, HTTPServer

class Manejador(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Hola desde un contenedor\n")

HTTPServer(("0.0.0.0", 8000), Manejador).serve_forever()` },
        { lang: "linux", text: code`
# Dockerfile
FROM python:3.14-slim
WORKDIR /app
COPY app.py .
EXPOSE 8000
CMD ["python", "app.py"]

# en la terminal
docker build -t hola:1.0 .
docker run --rm -p 8000:8000 hola:1.0
curl http://localhost:8000` },
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "El servidor escucha en 0.0.0.0 y no en localhost: dentro de un contenedor, localhost es el propio contenedor, y nada de afuera podría llegar. Es un error muy común. En el Dockerfile, FROM elige la imagen base (con versión fija y la variante slim, más liviana), WORKDIR fija la carpeta de trabajo, COPY trae el archivo y CMD indica el comando que se ejecuta al arrancar.",
        "docker build -t hola:1.0 . construye la imagen con ese nombre y versión usando el Dockerfile de la carpeta actual (el punto es el contexto). docker run --rm -p 8000:8000 la ejecuta: -p 8000:8000 conecta el puerto 8000 de tu computadora con el del contenedor (afuera:adentro) y --rm borra el contenedor al terminar.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier configuración de Docker:",
      ],
      lista: [
        "Imagen y contenedor: la imagen es la plantilla (se construye una vez); el contenedor es una ejecución (se crean y se destruyen todo el tiempo).",
        "Capas y caché: el orden del Dockerfile importa. Copiá primero las dependencias y recién después el código, así cambiar el código no reinstala todo.",
        "Volúmenes: el único lugar donde los datos sobreviven al contenedor.",
        "Redes y puertos: los contenedores en la misma red se ven por el nombre del servicio; el exterior solo entra por los puertos publicados.",
        "Compose: un archivo YAML que describe todos los servicios de la aplicación y los levanta juntos.",
      ],
      codigo: [
        { lang: "linux", text: code`
# compose.yaml
services:
  web:
    build: .
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql://app:cambiame@db/tienda
    depends_on: [db]
  db:
    image: postgres:18
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: cambiame
      POSTGRES_DB: tienda
    volumes: ["datos-pg:/var/lib/postgresql/data"]
volumes:
  datos-pg:

# docker compose up -d` },
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más problemas dan:",
      ],
      lista: [
        "Guardar datos dentro del contenedor: al borrarlo o recrearlo, se pierden. Usá un volumen.",
        "Escuchar en localhost dentro del contenedor: nada de afuera llega. Escuchá en 0.0.0.0.",
        "Meter secretos en la imagen (ENV, COPY de un .env): quedan en las capas y se filtran al compartir la imagen. Pasalos al arrancar.",
        "Usar la etiqueta latest: hoy y mañana pueden ser imágenes distintas. Fijá la versión.",
        "Correr como root: si vulneran la aplicación, tienen control del contenedor. Creá un usuario sin privilegios.",
        "No usar .dockerignore: el contexto incluye .git y dependencias locales, tarda y puede filtrar secretos.",
        "Un Dockerfile que copia todo antes de instalar dependencias: cada cambio de una línea de código reinstala todo.",
        "Publicar la base de datos en un puerto abierto al mundo (-p 5432:5432) en un servidor: queda expuesta. Dejala en la red interna.",
        "Pensar que un contenedor es una barrera de seguridad perfecta: comparte el núcleo con el anfitrión. Es aislamiento, no una caja fuerte.",
      ],
      codigo: [
        { lang: "linux", text: code`
# MAL: cada cambio del código reinstala las dependencias
COPY . .
RUN pip install -r requirements.txt

# BIEN: las dependencias van primero y se reutiliza la caché
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .` },
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "Docker se volvió estándar, pero no es para todo:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Docker?", "Por qué"],
        filas: [
          ["Aplicaciones web y APIs", "Sí", "Un entorno igual en desarrollo, integración continua y producción."],
          ["Levantar el proyecto con base de datos y caché", "Sí", "Compose arma todo con un comando."],
          ["Integración continua y pruebas reproducibles", "Sí", "Cada ejecución parte de un entorno limpio."],
          ["Servicios que se escalan en varios servidores", "Sí, con un orquestador", "Kubernetes u otro reparte y reinicia los contenedores."],
          ["Una base de datos de producción con datos críticos", "Con cuidado", "Posible, pero exige volúmenes, copias y manejo cuidadoso; muchos usan servicios gestionados."],
          ["Aplicaciones con interfaz gráfica de escritorio", "No", "No es el uso para el que se diseñó."],
          ["Un script de dos líneas en tu computadora", "No", "No hace falta empaquetarlo."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de Docker cuando…"],
        filas: [
          ["Podman", "querés ejecutar contenedores sin un servicio central con privilegios; los comandos son casi los mismos."],
          ["Máquinas virtuales", "necesitás aislamiento fuerte o un sistema operativo distinto al del anfitrión."],
          ["Plataformas gestionadas (Vercel, Fly.io, Cloud Run)", "no querés administrar servidores: subís el código o la imagen y ellos la ejecutan."],
          ["Un entorno virtual del lenguaje", "solo necesitás aislar dependencias de un proyecto en tu computadora."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Usá la pestaña Referencia de este tema para recordar los comandos. Para practicar, empaquetá un proyecto tuyo: escribí su Dockerfile, levantalo con una base de datos usando Compose, comprobá que los datos sobreviven a docker compose down y volvé a levantarlo. Después medí el tamaño de la imagen y probá reducirlo con una construcción en varias etapas.",
        "La documentación oficial de Docker incluye una guía de buenas prácticas para escribir Dockerfiles, imprescindible antes de publicar. Para seguridad, la hoja de referencia de OWASP sobre Docker resume las recomendaciones principales.",
      ],
    },
  ],
  fuentes: [
    { texto: "Documentación de Docker", url: "https://docs.docker.com/" },
    { texto: "Referencia del Dockerfile", url: "https://docs.docker.com/reference/dockerfile/" },
    { texto: "Buenas prácticas de construcción", url: "https://docs.docker.com/build/building/best-practices/" },
    { texto: "OWASP: Docker Security", url: "https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html" },
  ],
  revisada: "2026-11-12",
};
