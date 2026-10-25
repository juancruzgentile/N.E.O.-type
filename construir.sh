#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Necesitás Node.js 20 o superior"; exit 1; }
[ -d node_modules ] || npm ci
npm run build
echo "Listo: abrí NeonType.html o ejecutá ./iniciar.sh"
