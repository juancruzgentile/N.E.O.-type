import { type Topic, a, b, code, m } from "./types";

export const linux: Topic = {
  id: "linux",
  name: "Terminal Linux",
  group: "Herramientas",
  emblem: "linux",
  badge: ">_",
  color: "#7dff6b",
  hl: "linux",
  summary:
    "La terminal (shell) permite manejar el sistema escribiendo comandos: archivos, procesos, paquetes, redes y servidores. " +
    "La shell más común es Bash; los comandos se combinan con tuberías (|) y se automatizan en scripts.",
  facts: [
    { label: "Shell", value: "bash · zsh" },
    { label: "Ayuda", value: "man comando · comando --help" },
    { label: "Scripts", value: ".sh con #!/usr/bin/env bash" },
    { label: "Paquetes", value: "apt · dnf · pacman" },
  ],
  workflow: [
    { title: "Leer antes de ejecutar", text: "Nunca pegues un comando que no entendés, sobre todo con sudo, rm -rf o | bash. man y --help explican cada opción." },
    { title: "Atajos que ahorran horas", text: "Tab autocompleta, flecha arriba repite, Ctrl+R busca en el historial, Ctrl+C corta y Ctrl+L limpia." },
    { title: "Scripts seguros", text: "Empezá los scripts con set -euo pipefail: cortan ante el primer error y ante variables sin definir. Citá siempre las variables (\"$var\")." },
    { title: "Permisos mínimos", text: "Trabajá como usuario normal y usá sudo solo para el comando que lo necesita." },
  ],
  entries: [
    b("Navegación", "pwd, ls y cd", "pwd dice dónde estás, ls lista el contenido y cd cambia de carpeta (~ es tu carpeta personal, .. la de arriba).", code`
pwd
ls -la            # todo, con detalles y ocultos
cd ~/proyectos
cd ..
cd -              # vuelve a la anterior`, "listar directorio carpeta moverse"),
    b("Archivos", "mkdir, touch, cp, mv y rm", "Crear carpetas y archivos, copiar, mover o renombrar y borrar. rm no tiene papelera.", code`
mkdir -p src/componentes
touch notas.txt
cp notas.txt copia.txt
mv copia.txt viejo/notas.txt
rm -r carpeta_vieja`, "crear copiar mover borrar"),
    b("Archivos", "cat, less, head y tail", "Ver contenido: completo, paginado, el principio o el final (tail -f sigue un log en vivo).", code`
cat config.txt
less registro.log
head -n 20 datos.csv
tail -f /var/log/syslog`, "ver leer archivo log"),
    b("Búsqueda", "grep", "Busca texto dentro de archivos. -r en carpetas, -i sin mayúsculas, -n con número de línea.", code`
grep -rn "TODO" src/
grep -i "error" app.log
ps aux | grep python`, "buscar texto patron"),
    b("Búsqueda", "find", "Busca archivos por nombre, tipo, tamaño o fecha.", code`
find . -name "*.py"
find . -type f -size +10M
find logs -mtime +30 -delete`, "buscar archivos"),
    b("Sistema", "sudo y paquetes", "sudo ejecuta como administrador. Cada familia de distribuciones tiene su gestor de paquetes.", code`
sudo apt update && sudo apt install git     # Ubuntu, Debian, Mint
sudo dnf install git                        # Fedora
sudo pacman -S git                          # Arch, CachyOS`, "instalar apt dnf pacman administrador"),

    m("Permisos", "chmod y chown", "Cambian permisos (lectura, escritura, ejecución) y dueño de archivos.", code`
chmod +x script.sh
chmod 644 config.txt      # rw-r--r--
sudo chown -R ana:ana /srv/app`, "permisos ejecutar dueno"),
    m("Combinar", "Tuberías y redirecciones", "| pasa la salida de un comando a otro; > guarda en un archivo (pisa), >> agrega y 2> redirige los errores.", code`
cat acceso.log | grep 404 | wc -l
ls -1 > lista.txt
echo "nueva línea" >> lista.txt
comando 2> errores.txt`, "pipe redireccion salida"),
    m("Procesos", "ps, top, kill", "Ver y controlar procesos. htop es una versión más cómoda de top.", code`
ps aux | grep node
top
kill 12345
kill -9 12345   # forzar (último recurso)`, "proceso matar memoria cpu"),
    m("Variables", "Variables de entorno", "Configuración que heredan los programas. export la deja disponible para los procesos hijos.", code`
echo "$HOME"
export API_URL="http://localhost:8000"
PATH="$HOME/.local/bin:$PATH"`, "env entorno path variable"),
    m("Archivos", "tar y zip", "Comprimir y descomprimir.", code`
tar -czf respaldo.tar.gz proyecto/
tar -xzf respaldo.tar.gz
zip -r proyecto.zip proyecto/
unzip proyecto.zip`, "comprimir descomprimir backup"),
    m("Red", "curl y ssh", "curl hace pedidos HTTP; ssh abre una terminal en otra máquina.", code`
curl -s https://api.github.com/repos/torvalds/linux | head
curl -X POST -H "Content-Type: application/json" -d '{"ok":true}' localhost:8000/api
ssh usuario@servidor.com
scp archivo.txt usuario@servidor.com:/tmp/`, "http api remoto servidor"),

    a("Scripts", "Script Bash", "Automatiza tareas. set -euo pipefail corta ante errores; las funciones y los if hacen el resto.", code`
#!/usr/bin/env bash
set -euo pipefail

destino="\${1:-respaldo}"
if [[ ! -d "$destino" ]]; then
  mkdir -p "$destino"
fi
for f in *.txt; do
  cp "$f" "$destino/"
done
echo "Copiados a $destino"`, "bash script automatizar"),
    a("Texto", "sed y awk", "sed reemplaza texto en flujo; awk procesa columnas.", code`
sed -i 's/http:/https:/g' config.txt
awk -F, '{ total += $3 } END { print total }' ventas.csv
awk '$9 == 404 { print $7 }' acceso.log | sort | uniq -c | sort -rn`, "reemplazar columnas procesar texto"),
    a("Servicios", "systemctl y journalctl", "Controlan servicios de systemd y leen sus registros.", code`
sudo systemctl status nginx
sudo systemctl restart nginx
sudo systemctl enable --now docker
journalctl -u nginx -f`, "servicio daemon logs systemd"),
    a("Sistema", "df, du y free", "Espacio en disco, tamaño de carpetas y memoria.", code`
df -h
du -sh * | sort -h
free -h`, "disco espacio memoria"),
    a("Automatizar", "cron", "Ejecuta comandos de forma programada. crontab -e edita la tabla del usuario.", code`
# min hora día mes día_semana comando
0 3 * * * /home/ana/respaldo.sh
*/15 * * * * curl -s localhost:8000/salud > /dev/null`, "programar tarea periodica"),
    a("Contenedores", "docker", "Corre aplicaciones en contenedores aislados.", code`
docker run -d -p 8080:80 --name web nginx
docker ps
docker logs -f web
docker compose up --build
docker compose down`, "contenedor imagen compose"),
  ],
};

export const git: Topic = {
  id: "git",
  name: "Git",
  group: "Herramientas",
  emblem: null,
  badge: "GIT",
  color: "#f05133",
  hl: "linux",
  summary:
    "Sistema de control de versiones: guarda la historia del proyecto en commits, permite trabajar en ramas paralelas y combinar el trabajo de varias personas. " +
    "GitHub, GitLab y Bitbucket alojan repositorios Git y suman pull requests, revisiones y CI.",
  facts: [
    { label: "Instalar", value: "git (gestor de paquetes)" },
    { label: "Ayuda", value: "git help comando" },
    { label: "Ramas", value: "main + ramas por tarea" },
    { label: "Ignorar", value: ".gitignore" },
  ],
  workflow: [
    { title: "Una rama por tarea", text: "Creá una rama para cada cambio (feature/login, fix/total), abrí un pull request y fusioná después de la revisión." },
    { title: "Commits chicos y claros", text: "Cada commit hace una sola cosa y su mensaje explica qué y por qué. Es más fácil revisar, revertir y entender la historia." },
    { title: "Pull antes de empezar", text: "git pull al empezar el día y antes de abrir el pull request evita conflictos grandes." },
    { title: "Nunca subas secretos", text: "Claves y contraseñas van en variables de entorno o archivos ignorados (.env en .gitignore)." },
    { title: "No reescribas historia compartida", text: "rebase y push --force solo en tus ramas propias, nunca en main." },
  ],
  entries: [
    b("Inicio", "git init y git clone", "init crea un repositorio nuevo; clone copia uno existente.", code`
git init
git clone https://github.com/usuario/proyecto.git`, "crear repositorio clonar"),
    b("Configuración", "git config", "Nombre y email que firman tus commits.", code`
git config --global user.name "Ana Torres"
git config --global user.email "ana@mail.com"
git config --global init.defaultBranch main`, "configurar usuario"),
    b("Cambios", "git status y git diff", "status muestra qué cambió; diff muestra las líneas exactas.", code`
git status
git diff              # sin preparar
git diff --staged     # preparado para el commit`, "estado diferencias"),
    b("Cambios", "git add y git commit", "add prepara los cambios y commit los guarda en la historia con un mensaje.", code`
git add archivo.py
git add -p            # elegir partes de a una
git commit -m "Agrego validación del email"`, "preparar guardar confirmar"),
    b("Remoto", "git push y git pull", "push sube tus commits; pull trae y combina los del remoto.", code`
git push -u origin mi-rama   # la primera vez
git push
git pull`, "subir bajar remoto sincronizar"),
    b("Historia", "git log", "Lista los commits. --oneline y --graph lo hacen compacto.", code`
git log --oneline --graph --all
git log -p archivo.py
git log --author="Ana" --since="2 weeks ago"`, "historial commits"),

    m("Ramas", "git switch y git branch", "Crear, cambiar y listar ramas.", code`
git switch -c feature/login   # crea y cambia
git switch main
git branch                    # lista
git branch -d feature/login   # borra (si ya se fusionó)`, "rama crear cambiar checkout"),
    m("Ramas", "git merge", "Une otra rama a la actual. Si hay conflictos, se resuelven en los archivos marcados y se hace commit.", code`
git switch main
git merge feature/login
# conflictos: editar, luego
git add archivo.py
git commit`, "fusionar unir conflicto"),
    m("Deshacer", "git restore", "Descarta cambios en archivos o los saca del área de preparación.", code`
git restore archivo.py           # descarta cambios locales
git restore --staged archivo.py  # lo saca del add`, "deshacer descartar"),
    m("Deshacer", "git revert", "Crea un commit nuevo que deshace otro. Es la forma segura en ramas compartidas.", code`
git revert a1b2c3d`, "revertir deshacer commit"),
    m("Guardar", "git stash", "Guarda cambios a medias para cambiar de rama y recuperarlos después.", code`
git stash push -m "a medias"
git switch otra-rama
git switch -
git stash pop`, "guardar temporal"),
    m("Remoto", "git fetch y remotos", "fetch trae lo nuevo sin combinar; remote administra los repositorios remotos.", code`
git fetch origin
git remote -v
git remote add upstream https://github.com/original/proyecto.git`, "remoto origin upstream"),

    a("Historia", "git rebase", "Reaplica tus commits encima de otra rama para una historia lineal. -i permite reordenar, unir o editar commits.", code`
git fetch origin
git rebase origin/main
git rebase -i HEAD~3      # unir o editar los últimos 3 commits
git push --force-with-lease`, "rebase historia lineal squash"),
    a("Historia", "git cherry-pick", "Copia un commit puntual de otra rama a la actual.", code`
git cherry-pick a1b2c3d`, "copiar commit"),
    a("Deshacer", "git reset", "Mueve la rama a otro commit. --soft conserva los cambios preparados; --hard descarta también los cambios sin commitear, y esos no se recuperan. Los commits que quedan afuera siguen un tiempo en git reflog.", code`
git reset --soft HEAD~1   # deshace el último commit, conserva cambios
git reset --soft HEAD^    # lo mismo: ^ es el commit anterior
git stash                 # antes de un --hard, guardá lo que no commiteaste
git reset --hard HEAD~1   # descarta el commit y los cambios sin guardar
git reflog                # muestra a dónde apuntaba la rama, para volver`, "deshacer commit reset reflog recuperar"),
    a("Rescate", "git reflog", "Historial de adónde apuntó HEAD: sirve para recuperar commits que parecían perdidos.", code`
git reflog
git switch -c rescate HEAD@{3}`, "recuperar perdido"),
    a("Depurar", "git bisect", "Búsqueda binaria del commit que introdujo un error.", code`
git bisect start
git bisect bad              # el actual tiene el error
git bisect good v1.5.0      # esta versión andaba
# probar y marcar good/bad hasta encontrarlo
git bisect reset`, "buscar error bug"),
    a("Versiones", "git tag", "Marca un commit como versión.", code`
git tag -a v1.6.0 -m "Versión 1.6.0"
git push origin v1.6.0`, "etiqueta version release"),
  ],
};

export const formats: Topic = {
  id: "formats",
  name: "Formatos de datos",
  group: "Web y datos",
  emblem: "formats",
  badge: "FM",
  color: "#c3c9d4",
  hl: "formats",
  summary:
    "Los formatos de texto con los que se configuran proyectos e intercambian datos: JSON para APIs, YAML para configuración (Docker, CI), " +
    "TOML para proyectos (pyproject.toml, Cargo.toml), Markdown para documentación y .env para variables de entorno.",
  facts: [
    { label: "JSON", value: ".json · APIs y configuración" },
    { label: "YAML", value: ".yml · Docker Compose, CI" },
    { label: "TOML", value: ".toml · Python, Rust" },
    { label: "Markdown", value: ".md · README y documentación" },
  ],
  workflow: [
    { title: "Validar al guardar", text: "Un error de coma en JSON o de sangría en YAML rompe todo. Usá un editor que valide y formatee." },
    { title: "YAML: espacios en la sangría", text: "La sangría define la estructura y solo puede tener espacios: una tabulación ahí es un error. Dos espacios por nivel es la convención, no una regla." },
    { title: "Secretos fuera del repositorio", text: "El archivo .env real va en .gitignore; subí un .env.example sin valores." },
    { title: "Un README útil", text: "Qué es el proyecto, cómo instalarlo, cómo ejecutarlo y cómo contribuir, en ese orden." },
  ],
  entries: [
    b("JSON", "JSON: objetos y arrays", "Claves siempre entre comillas dobles, sin comas finales ni comentarios.", code`
{
  "nombre": "Ana",
  "edad": 30,
  "activo": true,
  "tags": ["admin", "dev"],
  "direccion": null
}`, "json objeto array"),
    b("YAML", "YAML: claves y listas", "Clave: valor, listas con guion y anidamiento por sangría.", code`
nombre: Ana
edad: 30
lenguajes:
  - python
  - go
direccion:
  ciudad: Roma`, "yaml yml lista"),
    b("Markdown", "Markdown básico", "Títulos con #, énfasis, listas, enlaces y bloques de código.", code`
# Título
## Subtítulo

Texto con **negrita**, *cursiva* y \`código\`.

- Uno
- Dos

[Enlace](https://ejemplo.com)`, "md readme documentacion"),
    b("Entorno", ".env", "Variables de entorno, una por línea. Lo leen herramientas como Docker Compose o dotenv.", code`
DATABASE_URL=postgresql://user:clave@localhost:5432/app
DEBUG=true
API_KEY=cambiar-esto`, "variables entorno secretos"),

    m("TOML", "TOML", "Configuración legible con secciones entre corchetes.", code`
[project]
name = "mi-app"
version = "0.1.0"
dependencies = ["requests>=2.32"]

[tool.ruff]
line-length = 100`, "toml pyproject cargo"),
    m("YAML", "YAML: textos multilínea y anclas", "| conserva saltos de línea, > los pliega; & y * reutilizan bloques.", code`
script: |
  npm ci
  npm test
base: &base
  image: node:24
prueba:
  <<: *base
  command: npm test`, "multilinea anclas alias"),
    m("Docker", "Dockerfile", "Receta para construir una imagen de contenedor.", code`
FROM node:24-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]`, "docker imagen contenedor"),
    m("Docker", "docker-compose.yml", "Varios contenedores que trabajan juntos.", code`
services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: secreto`, "compose servicios"),

    a("CI", "GitHub Actions", "Flujos de trabajo en YAML que corren en cada push o pull request. Para más seguridad, fijá cada acción por su SHA completo (como hace este proyecto) y dejá que Dependabot la actualice; una versión mayor nueva puede pedir un runner actualizado.", code`
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
      - run: npm ci
      - run: npm test`, "ci workflow github actions integracion continua"),
    a("JSON", "JSON Schema", "Describe y valida la forma de un JSON.", code`
{
  "type": "object",
  "required": ["nombre"],
  "properties": {
    "nombre": { "type": "string", "minLength": 1 },
    "edad": { "type": "integer", "minimum": 0 }
  }
}`, "validar esquema schema"),
    a("JSON", "jq", "Herramienta de terminal para filtrar y transformar JSON.", code`
curl -s api/tareas | jq '.[] | select(.hecha == false) | .titulo'
jq '.dependencies | keys' package.json`, "filtrar json terminal"),
    a("Datos", "CSV", "Valores separados por comas: la primera fila son los encabezados; los campos con comas van entre comillas.", code`
id,nombre,ciudad
1,Ana,"Roma, Italia"
2,Luis,Madrid`, "csv tabla planilla"),
  ],
};
