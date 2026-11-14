import { type Topic, a, b, code, m } from "./types";
import { claseDocker } from "./clases/docker";

export const docker: Topic = {
  id: "docker",
  name: "Docker y despliegue",
  group: "Herramientas",
  emblem: null,
  badge: "DK",
  color: "#2f9bf2",
  hl: "linux",
  summary:
    "Docker empaqueta una aplicación con todo lo que necesita para correr (sistema base, bibliotecas, configuración) en una imagen que funciona igual en tu computadora, en el servidor del CI y en la nube. " +
    "Acá están los comandos, el Dockerfile, los volúmenes, Compose y las buenas prácticas para publicar sin sorpresas.",
  facts: [
    { label: "Imagen", value: "la plantilla de solo lectura (se construye con un Dockerfile)" },
    { label: "Contenedor", value: "una imagen en ejecución" },
    { label: "Archivos", value: "Dockerfile · .dockerignore · compose.yaml" },
    { label: "Registro", value: "Docker Hub · GitHub Container Registry" },
  ],
  workflow: [
    { title: "Una imagen para todos los entornos", text: "La misma imagen que probaste es la que se publica. Lo que cambia entre entornos (claves, direcciones) entra como variables, no dentro de la imagen." },
    { title: "Imágenes chicas y con versión fija", text: "Partí de una imagen base liviana y con etiqueta de versión (python:3.14-slim), nunca latest. Menos tamaño es menos superficie de ataque y descargas más rápidas." },
    { title: "El contenedor no es de usar y guardar", text: "Lo que se escribe dentro de un contenedor se pierde al borrarlo. Los datos que importan van en un volumen o en un servicio externo." },
    { title: "Sin secretos en la imagen", text: "Una clave dentro de la imagen queda en sus capas para siempre. Pasala al arrancar, desde variables o un gestor de secretos." },
    { title: "No corras como root", text: "Creá un usuario sin privilegios en la imagen. Si alguien vulnera la aplicación, tiene mucho menos poder." },
  ],
  entries: [
    b("Contenedores", "docker run: arrancar un contenedor", "Descarga la imagen si no la tiene y crea un contenedor. -d lo deja en segundo plano, --name le pone nombre, --rm lo borra al terminar.", code`
docker run hello-world
docker run -d --name web -p 8080:80 nginx
docker run --rm -it python:3.14-slim python`, "run arrancar contenedor nginx imagen"),
    b("Contenedores", "ps, logs, exec y stop", "Para ver qué corre, leer su salida, entrar a un contenedor y detenerlo. -a incluye los detenidos.", code`
docker ps
docker ps -a
docker logs -f web
docker exec -it web sh
docker stop web
docker rm web`, "ps logs exec stop rm contenedores listar entrar"),
    b("Imágenes", "Imágenes: pull, images y rmi", "Una imagen es la plantilla de la que salen los contenedores. Se descarga de un registro (por defecto Docker Hub) y se identifica por nombre y etiqueta.", code`
docker pull postgres:18
docker images
docker image rm postgres:18`, "imagen pull images descargar etiqueta tag registro"),
    b("Dockerfile", "Un Dockerfile básico", "Cada instrucción es una capa: se parte de una imagen base (FROM), se copian archivos, se instala lo necesario y se indica qué ejecutar. Lo que cambia menos va primero para aprovechar la caché.", code`
FROM python:3.14-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["python", "app.py"]`, "dockerfile from copy run cmd capas cache"),
    m("Dockerfile", "docker build y etiquetas", "build construye la imagen a partir del Dockerfile y del contexto (la carpeta). -t le pone nombre y versión.", code`
docker build -t mi-app:1.0 .
docker run --rm mi-app:1.0
docker tag mi-app:1.0 ghcr.io/ana/mi-app:1.0
docker push ghcr.io/ana/mi-app:1.0`, "build tag push etiqueta construir imagen registro"),
    m("Ejecución", "Puertos y variables de entorno", "-p publica un puerto del contenedor en tu máquina (afuera:adentro). -e y --env-file pasan la configuración sin meterla en la imagen.", code`
docker run -d -p 8000:8000 \
  -e DATABASE_URL=postgresql://app@db/tienda \
  --env-file .env \
  mi-app:1.0`, "puertos -p variables entorno -e env-file configuracion"),
    m("Datos", "Volúmenes: que los datos sobrevivan", "Un volumen guarda datos fuera del ciclo de vida del contenedor. Un bind mount monta una carpeta tuya, útil en desarrollo. Desde PostgreSQL 18 la imagen oficial guarda los datos en /var/lib/postgresql/18/docker, así que el volumen se monta en /var/lib/postgresql.", code`
docker volume create datos-pg
docker run -d --name db -v datos-pg:/var/lib/postgresql \
  -e POSTGRES_PASSWORD=cambiame postgres:18

# desarrollo: tu código dentro del contenedor
docker run --rm -v "$PWD":/app -w /app python:3.14-slim python app.py`, "volumen volume bind mount datos persistencia"),
    m("Dockerfile", ".dockerignore: no mandar de más", "Lista lo que no debe entrar al contexto de construcción: el historial de Git, dependencias locales, archivos con secretos. Acelera el build y evita filtraciones.", code`
.git
node_modules
__pycache__
.env
*.log
Dockerfile`, "dockerignore contexto excluir secretos build rapido"),
    m("Compose", "Docker Compose: varios servicios juntos", "Compose describe en un archivo la aplicación y sus servicios (base de datos, caché) con sus redes y volúmenes, y los levanta con un solo comando.", code`
# compose.yaml
services:
  web:
    build: .
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql://app:cambiame@db/tienda
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:18
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: cambiame
      POSTGRES_DB: tienda
    volumes: ["datos-pg:/var/lib/postgresql"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d tienda"]
volumes:
  datos-pg:

# docker compose up -d     ·     docker compose logs -f web     ·     docker compose down`, "compose yaml servicios base datos depends_on"),
    a("Dockerfile", "Construcción en varias etapas", "Una etapa compila con todas las herramientas y la imagen final solo copia el resultado. Queda mucho más chica y sin compiladores que un atacante podría aprovechar.", code`
FROM golang:1.27 AS construir
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /servidor .

FROM gcr.io/distroless/static-debian12
COPY --from=construir /servidor /servidor
USER nonroot
ENTRYPOINT ["/servidor"]`, "multi stage multietapa imagen chica distroless"),
    a("Seguridad", "Usuario sin privilegios y healthcheck", "Por defecto el proceso corre como root dentro del contenedor. Un usuario común limita el daño, y HEALTHCHECK permite saber si la aplicación realmente responde.", code`
FROM python:3.14-slim
RUN useradd --create-home --uid 10001 app
WORKDIR /home/app
COPY --chown=app:app . .
USER app

HEALTHCHECK --interval=30s --timeout=3s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/salud')" || exit 1
CMD ["python", "app.py"]`, "usuario no root healthcheck seguridad privilegios"),
    a("Mantenimiento", "Ver el espacio y limpiar", "Imágenes, contenedores detenidos y volúmenes sin uso se acumulan y llenan el disco. system df muestra cuánto ocupa cada cosa y prune limpia lo que no se usa.", code`
docker system df
docker container prune
docker image prune -a
docker builder prune
# CUIDADO: borra lo que no usa ningún contenedor, volúmenes incluidos
docker system prune --volumes`, "prune limpiar espacio disco df imagenes sin uso"),
  ],
  clase: claseDocker,
};
