@echo off
REM Abre N.E.O.-type en el navegador (no necesita Node ni internet).
cd /d "%~dp0"
if not exist "NeonType.html" (
  echo No existe NeonType.html. Ejecuta primero construir.bat
  pause
  exit /b 1
)
start "" "NeonType.html"
