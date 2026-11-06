import type { FuentesTema } from "./tipos";

const M = "https://man7.org/linux/man-pages/";
const G = "https://www.gnu.org/software/";
export const linux: FuentesTema = {
  version: "GNU/Linux con bash 5",
  entradas: {
    "pwd, ls y cd": [M + "man1/ls.1.html"],
    "mkdir, touch, cp, mv y rm": [M + "man1/cp.1.html"],
    "cat, less, head y tail": [M + "man1/less.1.html"],
    "grep": [G + "grep/manual/grep.html"],
    "find": [M + "man1/find.1.html"],
    "sudo y paquetes": ["https://www.sudo.ws/docs/man/sudo.man/"],
    "chmod y chown": [M + "man1/chmod.1.html"],
    "Tuberías y redirecciones": [G + "bash/manual/html_node/Redirections.html"],
    "ps, top, kill": [M + "man1/ps.1.html"],
    "Variables de entorno": [G + "bash/manual/html_node/Environment.html"],
    "tar y zip": [G + "tar/manual/tar.html"],
    "curl y ssh": ["https://curl.se/docs/manpage.html"],
    "Script Bash": [G + "bash/manual/bash.html"],
    "sed y awk": [G + "sed/manual/sed.html"],
    "systemctl y journalctl": ["https://www.freedesktop.org/software/systemd/man/latest/systemctl.html"],
    "df, du y free": [G + "coreutils/manual/html_node/df-invocation.html"],
    "cron": [M + "man5/crontab.5.html"],
    "docker": ["https://docs.docker.com/reference/cli/docker/"],
  },
};
