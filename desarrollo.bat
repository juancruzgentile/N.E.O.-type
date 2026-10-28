@echo off
REM Servidor de desarrollo con recarga en caliente (para modificar el código).
cd /d "%~dp0"
where node >nul 2>nul || (echo Necesitas Node.js 20.19+ o 22.12+: https://nodejs.org & pause & exit /b 1)
if not exist "node_modules" call npm ci || (pause & exit /b 1)
call npm run dev
