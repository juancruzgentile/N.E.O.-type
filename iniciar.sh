#!/usr/bin/env bash
# Abre N.E.O.-type en el navegador (Fedora / Ubuntu).
cd "$(dirname "$0")"
if [ ! -f NeonType.html ]; then
  echo "No existe NeonType.html. Construyendo la aplicación..."
  ./construir.sh || exit 1
fi
xdg-open NeonType.html >/dev/null 2>&1 &
