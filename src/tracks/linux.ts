// Ruta de terminal Linux: Ubuntu/Mint → Debian → Fedora → CachyOS → Arch.
// Cada comando se escribe para la distribución del ejercicio: gestor de paquetes,
// nombres de paquetes y servicios, grupo de administradores, firewall, etc.

import { chance, int, pick } from "../gen/base";
import type { DistroId } from "../types";
import type { Exercise, Topic, Track } from "./types";

type Family = "apt" | "dnf" | "pacman";

const DISTRO: Record<DistroId, { name: string; fam: Family }> = {
  ubuntu: { name: "Ubuntu", fam: "apt" },
  debian: { name: "Debian", fam: "apt" },
  mint: { name: "Linux Mint", fam: "apt" },
  cachyos: { name: "CachyOS", fam: "pacman" },
  arch: { name: "Arch Linux", fam: "pacman" },
  fedora: { name: "Fedora", fam: "dnf" },
};

const L = (...lines: string[]) => lines.join("\n");
const ex = (title: string, ...lines: string[]): Exercise => ({ title, text: L(...lines) });
const fam = (d: string) => DISTRO[d as DistroId].fam;
const en = (d: string) => `en ${DISTRO[d as DistroId].name}`;

// ─────────────────────────── Vocabulario ───────────────────────────

/** paquetes cuyo nombre depende de la familia (null: no existe con ese nombre) */
const PKGS: { es: string; apt: string; dnf: string | null; pacman: string }[] = [
  { es: "nginx", apt: "nginx", dnf: "nginx", pacman: "nginx" },
  { es: "Git", apt: "git", dnf: "git", pacman: "git" },
  { es: "curl", apt: "curl", dnf: "curl", pacman: "curl" },
  { es: "htop", apt: "htop", dnf: "htop", pacman: "htop" },
  { es: "Neovim", apt: "neovim", dnf: "neovim", pacman: "neovim" },
  { es: "tmux", apt: "tmux", dnf: "tmux", pacman: "tmux" },
  { es: "ripgrep", apt: "ripgrep", dnf: "ripgrep", pacman: "ripgrep" },
  { es: "Apache", apt: "apache2", dnf: "httpd", pacman: "apache" },
  { es: "pip de Python", apt: "python3-pip", dnf: "python3-pip", pacman: "python-pip" },
  { es: "las herramientas de compilación", apt: "build-essential", dnf: null, pacman: "base-devel" },
  { es: "Node.js y npm", apt: "nodejs npm", dnf: "nodejs npm", pacman: "nodejs npm" },
  { es: "el servidor SSH", apt: "openssh-server", dnf: "openssh-server", pacman: "openssh" },
];

/** servicios de systemd según la familia */
const SERVICES: { es: string; apt: string; dnf: string; pacman: string }[] = [
  { es: "nginx", apt: "nginx", dnf: "nginx", pacman: "nginx" },
  { es: "Apache", apt: "apache2", dnf: "httpd", pacman: "httpd" },
  { es: "el servidor SSH", apt: "ssh", dnf: "sshd", pacman: "sshd" },
  { es: "PostgreSQL", apt: "postgresql", dnf: "postgresql", pacman: "postgresql" },
  { es: "Docker", apt: "docker", dnf: "docker", pacman: "docker" },
];

const ADMIN_GROUP: Record<Family, string> = { apt: "sudo", dnf: "wheel", pacman: "wheel" };
const WEB_USER: Record<Family, string> = { apt: "www-data", dnf: "nginx", pacman: "http" };

const PROJECTS = ["api", "webapp", "neo-type", "backend", "dotfiles", "scripts", "portfolio"];
const FILES = ["app.log", "notes.txt", "config.yaml", "data.csv", "report.pdf", "todo.md"];
const USERS = ["juan", "dev", "deploy", "maria", "backup", "ci"];
const HOSTS = ["192.168.1.20", "10.0.0.5", "srv.example.com", "vps.example.com"];
const AUR = ["visual-studio-code-bin", "google-chrome", "spotify", "brave-bin", "zoom"];

// ─────────────────────────── Escalón 1: Ubuntu / Mint ───────────────────────────

const nav: Topic = {
  id: "nav",
  gen(rng) {
    const p = pick(rng, PROJECTS);
    return pick(rng, [
      () => ex(`Crea la carpeta del proyecto ${p} con su src y entra en ella`, `mkdir -p projects/${p}/src && cd projects/${p}`),
      () => ex("Lista con detalle, ocultos incluidos y tamaños legibles, el contenido de /var/log", "ls -lah /var/log"),
      () => ex("Sube un nivel y muestra la ruta en la que estás", "cd .. && pwd"),
      () => ex("Muestra qué distribución y versión tienes instalada", "cat /etc/os-release"),
      () => ex(`Entra a la carpeta del proyecto ${p} y lista sus archivos ordenados por fecha`, `cd projects/${p} && ls -lt`),
      () => ex("Muestra el árbol de carpetas de src con dos niveles de profundidad", "tree -L 2 src/"),
    ])();
  },
};

const files: Topic = {
  id: "files",
  gen(rng) {
    const f = pick(rng, FILES);
    const p = pick(rng, PROJECTS);
    return pick(rng, [
      () => ex(`Copia la carpeta src de ${p} a una copia de seguridad`, `cp -r projects/${p}/src backup/${p}-src`),
      () => ex(`Mueve ${f} a la carpeta docs`, `mv ${f} docs/`),
      () => ex("Borra las carpetas build y dist sin pedir confirmación", "rm -rf build/ dist/"),
      () => ex("Crea un archivo .env vacío y ábrelo con nano", "touch .env && nano .env"),
      () => ex(`Muestra las primeras 20 líneas de ${f}`, `head -n 20 ${f}`),
      () => ex("Sigue en vivo las últimas líneas de app.log", "tail -f app.log"),
      () => ex(`Crea un enlace simbólico para usar ${p} como comando`, `sudo ln -s /opt/${p}/bin/${p} /usr/local/bin/${p}`),
    ])();
  },
};

const install: Topic = {
  id: "install",
  gen(rng, d) {
    const pk = pick(rng, PKGS);
    const name = pk[fam(d)];
    if (!name) return null;
    const title = `Instala ${pk.es} ${en(d)}`;
    if (fam(d) === "apt") return ex(title, `sudo apt install -y ${name}`);
    if (fam(d) === "dnf") return ex(title, `sudo dnf install -y ${name}`);
    return ex(title, `sudo pacman -S --needed ${name}`);
  },
};

const upgrade: Topic = {
  id: "upgrade",
  gen(rng, d) {
    const title = `Actualiza todo el sistema ${en(d)}`;
    if (fam(d) === "apt") return ex(title, chance(rng, 0.5) ? "sudo apt update && sudo apt upgrade -y" : "sudo apt update && sudo apt full-upgrade -y");
    if (fam(d) === "dnf") return ex(title, "sudo dnf upgrade --refresh -y");
    return ex(title, "sudo pacman -Syu");
  },
};

const pkgManage: Topic = {
  id: "packages",
  gen(rng, d) {
    const pk = pick(rng, PKGS);
    const name = pk[fam(d)];
    if (!name || name.includes(" ")) return null;
    const f = fam(d);
    return pick(rng, [
      () => ex(`Busca el paquete ${name} ${en(d)}`, f === "apt" ? `apt search ${name}` : f === "dnf" ? `dnf search ${name}` : `pacman -Ss ${name}`),
      () => ex(
        `Desinstala ${pk.es} junto con lo que ya no se usa ${en(d)}`,
        f === "apt" ? `sudo apt remove --purge -y ${name} && sudo apt autoremove -y` : f === "dnf" ? `sudo dnf remove -y ${name}` : `sudo pacman -Rns ${name}`,
      ),
      () => ex(
        `Verifica si ${pk.es} está instalado ${en(d)}`,
        f === "apt" ? `apt list --installed | grep ${name}` : f === "dnf" ? `dnf list --installed | grep ${name}` : `pacman -Qs ${name}`,
      ),
      () => ex(`Limpia la caché de paquetes descargados ${en(d)}`, f === "apt" ? "sudo apt clean" : f === "dnf" ? "sudo dnf clean all" : "sudo pacman -Sc"),
    ])();
  },
};

// ─────────────────────────── Escalón 2: Debian ───────────────────────────

const users: Topic = {
  id: "users",
  gen(rng, d) {
    const u = pick(rng, USERS);
    const f = fam(d);
    return pick(rng, [
      () => f === "apt"
        ? ex(`Crea el usuario ${u} ${en(d)}`, `sudo adduser ${u}`)
        : ex(`Crea el usuario ${u} con su carpeta personal y bash ${en(d)}`, `sudo useradd -m -s /bin/bash ${u} && sudo passwd ${u}`),
      () => ex(`Dale permisos de administrador a ${u} ${en(d)}`, `sudo usermod -aG ${ADMIN_GROUP[f]} ${u}`),
      () => ex(`Muestra los grupos y el id del usuario ${u}`, `id ${u} && groups ${u}`),
      () => ex(`Cambia al usuario ${u} con su entorno completo`, `sudo su - ${u}`),
    ])();
  },
};

const perms: Topic = {
  id: "perms",
  gen(rng, d) {
    const p = pick(rng, PROJECTS);
    return pick(rng, [
      () => ex("Haz ejecutable el script deploy.sh y ejecútalo", "chmod +x deploy.sh && ./deploy.sh"),
      () => ex("Deja .env legible solo por su dueño y su grupo", "chmod 640 .env"),
      () => ex(
        `Dale la carpeta del sitio ${p} al usuario del servidor web ${en(d)}`,
        `sudo chown -R ${WEB_USER[fam(d)]}:${WEB_USER[fam(d)]} /var/www/${p}`,
      ),
      () => ex("Protege la carpeta .ssh y sus claves autorizadas", "chmod 700 .ssh && chmod 600 .ssh/authorized_keys"),
      () => ex(`Dale permisos 755 a todas las carpetas de ${p}`, `find ${p}/ -type d -exec chmod 755 {} +`),
    ])();
  },
};

const services: Topic = {
  id: "services",
  gen(rng, d) {
    const s = pick(rng, SERVICES);
    const name = s[fam(d)];
    return pick(rng, [
      () => ex(`Activa ${s.es} y haz que arranque con el sistema ${en(d)}`, `sudo systemctl enable --now ${name}`),
      () => ex(`Mira el estado del servicio de ${s.es} ${en(d)}`, `systemctl status ${name}`),
      () => ex(`Reinicia ${s.es} ${en(d)}`, `sudo systemctl restart ${name}`),
      () => ex(`Sigue en vivo los logs de ${s.es} ${en(d)}`, `journalctl -u ${name} -f`),
      () => ex(`Mira los logs de ${s.es} de la última hora ${en(d)}`, `journalctl -u ${name} --since "1 hour ago"`),
      () => ex("Muestra solo los errores del arranque actual", "sudo journalctl -p err -b"),
    ])();
  },
};

const ssh: Topic = {
  id: "ssh",
  gen(rng) {
    const u = pick(rng, USERS);
    const h = pick(rng, HOSTS);
    return pick(rng, [
      () => ex(`Conéctate por SSH al servidor ${h} como ${u}`, `ssh ${u}@${h}`),
      () => ex(`Conéctate por SSH a ${h} usando el puerto 2222`, `ssh -p 2222 ${u}@${h}`),
      () => ex("Genera un par de claves SSH ed25519 con tu email", `ssh-keygen -t ed25519 -C "${u}@example.com"`),
      () => ex(`Copia tu clave pública al servidor ${h}`, `ssh-copy-id ${u}@${h}`),
      () => ex(`Sube un backup al servidor ${h} con scp`, `scp backup.tar.gz ${u}@${h}:/srv/backups/`),
    ])();
  },
};

// ─────────────────────────── Escalón 3: Fedora ───────────────────────────

const firewall: Topic = {
  id: "firewall",
  gen(rng, d) {
    const port = pick(rng, [8080, 3000, 5432, 8443]);
    if (fam(d) === "dnf") {
      return pick(rng, [
        () => ex(`Abre HTTP y HTTPS en el firewall ${en(d)}`, "sudo firewall-cmd --permanent --add-service=http --add-service=https", "sudo firewall-cmd --reload"),
        () => ex(`Abre el puerto ${port} en el firewall ${en(d)}`, `sudo firewall-cmd --permanent --add-port=${port}/tcp && sudo firewall-cmd --reload`),
        () => ex(`Muestra la configuración actual del firewall ${en(d)}`, "sudo firewall-cmd --list-all"),
      ])();
    }
    // ufw viene en Ubuntu, Linux Mint y CachyOS; Debian y Arch no traen firewall por defecto
    if (d === "debian" || d === "arch") return null;
    return pick(rng, [
      () => ex(`Permite SSH y activa el firewall ${en(d)}`, "sudo ufw allow 22/tcp && sudo ufw enable"),
      () => ex(`Abre el puerto ${port} en el firewall ${en(d)}`, `sudo ufw allow ${port}/tcp`),
      () => ex(`Permite PostgreSQL solo desde la red local ${en(d)}`, "sudo ufw allow from 192.168.1.0/24 to any port 5432"),
      () => ex(`Muestra el estado detallado del firewall ${en(d)}`, "sudo ufw status verbose"),
    ])();
  },
};

const grep: Topic = {
  id: "grep",
  gen(rng) {
    const word = pick(rng, ["TODO", "FIXME", "password", "api_key", "console.log"]);
    const proc = pick(rng, ["python", "node", "java", "nginx"]);
    return pick(rng, [
      () => ex(`Busca "${word}" en todo src mostrando el número de línea`, `grep -rn "${word}" src/`),
      () => ex(`Busca los procesos de ${proc} que están corriendo`, `ps aux | grep ${proc}`),
      () => ex("Cuenta cuántas peticiones con error 404 hay en access.log", `grep -c " 404 " access.log`),
      () => ex("Busca en el historial los comandos ssh que usaste", "history | grep ssh"),
      () => ex("Muestra los 10 valores más repetidos de la primera columna de data.csv", "cut -d, -f1 data.csv | sort | uniq -c | sort -nr | head"),
    ])();
  },
};

const find: Topic = {
  id: "find",
  gen(rng) {
    const days = pick(rng, [7, 14, 30]);
    return pick(rng, [
      () => ex(`Borra los .log de más de ${days} días`, `find . -name "*.log" -mtime +${days} -delete`),
      () => ex("Busca todos los archivos .php dentro de /var/www", `find /var/www -type f -name "*.php"`),
      () => ex("Busca los archivos de más de 100 MB en tu carpeta", "find . -type f -size +100M"),
      () => ex("Borra todas las carpetas node_modules del proyecto", `find . -type d -name node_modules -prune -exec rm -rf {} +`),
    ])();
  },
};

const redirect: Topic = {
  id: "redirect",
  gen(rng) {
    const port = pick(rng, [3000, 8000, 8080]);
    return pick(rng, [
      () => ex("Agrega una variable al final de .env", `echo "PORT=${port}" >> .env`),
      () => ex("Guarda la salida y los errores del build en build.log", "npm run build > build.log 2>&1"),
      () => ex("Escribe un archivo de sistema con sudo usando tee", `echo "vm.swappiness=10" | sudo tee /etc/sysctl.d/99-swap.conf`),
      () => ex("Ejecuta el script descartando los mensajes de error", "./cleanup.sh 2> /dev/null"),
      () => ex("Restaura una base de datos MySQL desde un archivo", "mysql -u root -p shop < backup.sql"),
      () => ex("Cuenta las líneas de un archivo leyéndolo por la entrada estándar", "wc -l < data.csv"),
    ])();
  },
};

const disk: Topic = {
  id: "disk",
  gen(rng) {
    return pick(rng, [
      () => ex("Muestra el espacio libre de cada disco en formato legible", "df -h"),
      () => ex("Muestra cuánto ocupa cada carpeta, de menor a mayor", "du -sh * | sort -h"),
      () => ex("Muestra la memoria RAM y la swap", "free -h"),
      () => ex("Lista los discos y sus particiones", "lsblk -f"),
    ])();
  },
};

// ─────────────────────────── Escalón 4: CachyOS ───────────────────────────

const aur: Topic = {
  id: "aur",
  gen(rng, d) {
    if (fam(d) !== "pacman") return null;
    const pkg = pick(rng, AUR);
    if (d === "cachyos") {
      return pick(rng, [
        () => ex("Instala paru (ayudante del AUR) desde los repositorios de CachyOS", "sudo pacman -S --needed paru"),
        () => ex(`Instala ${pkg} desde el AUR con paru ${en(d)}`, `paru -S ${pkg}`),
        () => ex(`Actualiza el sistema y los paquetes del AUR ${en(d)}`, "paru -Syu"),
      ])();
    }
    return pick(rng, [
      () => ex("Compila e instala paru desde el AUR en Arch Linux", "sudo pacman -S --needed base-devel git", "git clone https://aur.archlinux.org/paru.git", "cd paru && makepkg -si"),
      () => ex(`Instala ${pkg} desde el AUR con paru ${en(d)}`, `paru -S ${pkg}`),
    ])();
  },
};

const mirrors: Topic = {
  id: "mirrors",
  gen(rng, d) {
    if (d === "cachyos") return ex("Mide y reordena los mirrors más rápidos en CachyOS", "sudo cachyos-rate-mirrors");
    if (d === "arch") {
      const c = pick(rng, ["Italy", "Germany", "Argentina"]);
      return ex(
        `Elige los 10 mirrors más rápidos de ${c === "Italy" ? "Italia" : c === "Germany" ? "Alemania" : "Argentina"} en Arch Linux`,
        `sudo reflector --country ${c} --latest 10 --sort rate --save /etc/pacman.d/mirrorlist`,
      );
    }
    return null;
  },
};

const procs: Topic = {
  id: "procs",
  gen(rng) {
    const pid = int(rng, 1200, 98000);
    const app = pick(rng, ["node server.js", "python app.py", "java -jar api.jar"]);
    return pick(rng, [
      () => ex(`Termina a la fuerza el proceso ${pid}`, `kill -9 ${pid}`),
      () => ex(`Termina el proceso que corre "${app}"`, `pkill -f "${app}"`),
      () => ex("Lista los procesos de python con su comando completo", "pgrep -a python"),
      () => ex("Ejecuta el backup con baja prioridad y en segundo plano", "nice -n 10 ./backup.sh &"),
      () => ex("Muestra los 5 procesos que más memoria consumen", "ps aux --sort=-%mem | head -n 6"),
    ])();
  },
};

const network: Topic = {
  id: "network",
  gen(rng) {
    return pick(rng, [
      () => ex("Muestra tus interfaces de red y sus IP en formato breve", "ip -br a"),
      () => ex("Muestra qué puertos están escuchando y qué proceso los usa", "sudo ss -tulpn"),
      () => ex("Pide solo las cabeceras HTTP de un sitio", "curl -I https://example.com"),
      () => ex("Haz 4 pings para comprobar la conexión", "ping -c 4 1.1.1.1"),
      () => ex("Descarga un script sin ejecutarlo para revisarlo antes", "curl -fsSL https://example.com/install.sh -o install.sh"),
    ])();
  },
};

const archives: Topic = {
  id: "archives",
  gen(rng) {
    const p = pick(rng, PROJECTS);
    const y = int(rng, 2024, 2026);
    return pick(rng, [
      () => ex(`Comprime la carpeta ${p} en un .tar.gz`, `tar -czvf ${p}-${y}.tar.gz ${p}/`),
      () => ex(`Descomprime ${p}.tar.gz dentro de /opt`, `sudo tar -xzvf ${p}.tar.gz -C /opt`),
      () => ex("Comprime la carpeta public en un zip", "zip -r site.zip public/"),
      () => ex("Descomprime data.zip en la carpeta data", "unzip data.zip -d data/"),
    ])();
  },
};

// ─────────────────────────── Escalón 5: Arch ───────────────────────────

const archInstall: Topic = {
  id: "install-base",
  gen(rng, d) {
    if (d !== "arch") return null;
    return pick(rng, [
      () => ex("Formatea la partición raíz y móntala en /mnt", "mkfs.ext4 /dev/sda2", "mount /dev/sda2 /mnt"),
      () => ex("Instala el sistema base de Arch Linux en /mnt", "pacstrap -K /mnt base linux linux-firmware"),
      () => ex("Genera el fstab y entra al sistema nuevo", "genfstab -U /mnt >> /mnt/etc/fstab", "arch-chroot /mnt"),
      () => ex("Configura la zona horaria de Roma y el reloj", "ln -sf /usr/share/zoneinfo/Europe/Rome /etc/localtime", "hwclock --systohc"),
      () => ex("Configura el idioma y el nombre del equipo", `echo "LANG=en_US.UTF-8" > /etc/locale.conf`, `echo "neo" > /etc/hostname`),
    ])();
  },
};

const scripting: Topic = {
  id: "scripting",
  gen(rng) {
    const dirs = pick(rng, ["logs tmp cache", "src tests docs", "data backups exports"]);
    return pick(rng, [
      () => ex("Comprime cada .log de la carpeta con un bucle", `for f in *.log; do gzip "$f"; done`),
      () => ex("Crea un backup con la fecha de hoy en el nombre", `NAME="backup-$(date +%F)"`, `tar -czf "$NAME.tar.gz" data/`),
      () => ex("Si no existe .env, créalo desde el ejemplo", `if [ ! -f .env ]; then cp .env.example .env; fi`),
      () => ex(
        "Script que crea las carpetas del proyecto y corta ante cualquier error",
        "#!/usr/bin/env bash",
        "set -euo pipefail",
        `for dir in ${dirs}; do`,
        `  mkdir -p "$dir"`,
        "done",
        `echo "listo"`,
      ),
      () => ex(
        "Script que avisa si el disco supera el 90%",
        "#!/usr/bin/env bash",
        `USO=$(df / | awk 'NR==2 { print $5 }' | tr -d '%')`,
        `if [ "$USO" -gt 90 ]; then`,
        `  echo "Disco casi lleno: $USO%"`,
        "fi",
      ),
    ])();
  },
};

const textTools: Topic = {
  id: "text",
  gen(rng) {
    const [a, b] = pick(rng, [["8080", "3000"], ["localhost", "0.0.0.0"], ["debug", "info"]]);
    return pick(rng, [
      () => ex(`Reemplaza "${a}" por "${b}" en config.yaml`, `sed -i 's/${a}/${b}/g' config.yaml`),
      () => ex("Imprime la primera columna de data.csv", `awk -F, '{ print $1 }' data.csv`),
      () => ex("Suma la tercera columna de data.csv", `awk -F, '{ total += $3 } END { print total }' data.csv`),
      () => ex("Agrega un alias para git status a tu .bashrc", `echo "alias gs='git status'" >> .bashrc && source .bashrc`),
    ])();
  },
};

const cron: Topic = {
  id: "cron",
  gen(rng) {
    const h = int(rng, 1, 5);
    return pick(rng, [
      () => ex(`Línea de crontab: backup todos los días a las ${h}:00`, `0 ${h} * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1`),
      () => ex("Línea de crontab: limpiar temporales cada 15 minutos", "*/15 * * * * find /tmp -type f -mmin +60 -delete"),
      () => ex("Línea de crontab: reporte los lunes a las 9:30", "30 9 * * 1 /opt/scripts/report.sh"),
      () => ex("Abre el editor de tareas programadas de tu usuario", "crontab -e"),
    ])();
  },
};

// ─────────────────────────── Ruta ───────────────────────────

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const ORDER: DistroId[] = ["ubuntu", "debian", "mint", "cachyos", "arch", "fedora"];

export const LINUX: Track = {
  id: "linux",
  label: "COMANDO",
  cumulative: true,
  batch: 3,
  freeSetting: "distro",
  variants: ORDER.map((id) => ({ id, name: DISTRO[id].name })),
  symbols: [
    "-", "/", ".", "&", "|", ">", "<", "$", '"', "'", "*", "=", ":", "@", "_", "+", ",", "%", "{", "}", "(", ")", "[", "]",
    ";", "!", "#", ...DIGITS,
  ],
  steps: [
    {
      id: "ubuntu", name: "Ubuntu / Mint", variants: ["ubuntu", "mint"],
      desc: "Moverte por carpetas, manejar archivos e instalar, actualizar y buscar paquetes con apt",
      topics: [nav, files, install, upgrade, pkgManage],
    },
    {
      id: "debian", name: "Debian", variants: ["debian"],
      desc: "Usuarios y grupos, permisos, servicios con systemctl, logs con journalctl y SSH",
      topics: [users, perms, services, ssh],
    },
    {
      id: "fedora", name: "Fedora", variants: ["fedora"],
      desc: "dnf, firewall con firewall-cmd, búsquedas con grep y find, tuberías, redirecciones y discos",
      topics: [firewall, grep, find, redirect, disk],
    },
    {
      id: "cachyos", name: "CachyOS", variants: ["cachyos"],
      desc: "pacman, AUR con paru, mirrors, procesos, red y archivos comprimidos",
      topics: [aur, mirrors, procs, network, archives],
    },
    {
      id: "arch", name: "Arch Linux", variants: ["arch"],
      desc: "Instalación base con pacstrap y arch-chroot, scripts de bash, sed, awk y cron",
      topics: [archInstall, scripting, textTools, cron],
    },
  ],
};
