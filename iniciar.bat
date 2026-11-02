@echo off
REM Abre N.E.O.-type en el navegador. Si falta NeonType.html, lo construye primero.
cd /d "%~dp0"
if not exist "NeonType.html" (
  echo No existe NeonType.html. Construyendo la aplicacion...
  where node >nul 2>nul || (echo Necesitas Node.js 20.19+ o 22.12+: https://nodejs.org & pause & exit /b 1)
  if not exist "node_modules" call npm ci || (pause & exit /b 1)
  call npm run build || (pause & exit /b 1)
)
start "" "NeonType.html"
