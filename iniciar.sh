#!/usr/bin/env bash
# Abre NeonType en el navegador (Fedora / Ubuntu).
cd "$(dirname "$0")"
[ -f NeonType.html ] || { echo "No existe NeonType.html. Ejecutá ./construir.sh"; exit 1; }
xdg-open NeonType.html >/dev/null 2>&1 &
