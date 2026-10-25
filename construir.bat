@echo off
REM Instala dependencias (la primera vez) y genera NeonType.html
cd /d "%~dp0"
where node >nul 2>nul || (echo Necesitas Node.js 20 o superior: https://nodejs.org & pause & exit /b 1)
if not exist "node_modules" call npm ci || (pause & exit /b 1)
call npm run build || (pause & exit /b 1)
echo.
echo Listo. Abri NeonType.html o ejecuta iniciar.bat
pause
