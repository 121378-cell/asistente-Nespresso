@echo off
chcp 65001 >nul
title Nespresso Assistant - Launcher

echo ╔════════════════════════════════════════════════════════════╗
echo ║     Nespresso Assistant - Iniciador Rápido                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no está instalado!
    echo.
    echo Por favor, instala Node.js desde: https://nodejs.org/
    echo.
    pause
    start https://nodejs.org/
    exit /b 1
)

echo ✅ Node.js encontrado
echo.

REM Verificar configuración
if not exist "backend\.env" (
    echo ⚠️  Primera vez ejecutando - Configuración necesaria
    echo.
    echo Ejecuta START.ps1 para configuración completa
    echo O crea manualmente backend\.env y .env.local
    echo.
    pause
    exit /b 1
)

if not exist ".env.local" (
    echo ⚠️  Falta archivo .env.local
    echo.
    echo Ejecuta START.ps1 para configuración completa
    echo.
    pause
    exit /b 1
)

echo ✅ Configuración encontrada
echo.

REM Instalar dependencias si es necesario
if not exist "node_modules" (
    echo 📦 Instalando dependencias del frontend...
    call npm install
    echo.
)

if not exist "backend\node_modules" (
    echo 📦 Instalando dependencias del backend...
    cd backend
    call npm install
    cd ..
    echo.
)

echo ╔════════════════════════════════════════════════════════════╗
echo ║              🚀 Iniciando Aplicación...                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📊 Backend: http://localhost:3001
echo 🌐 Frontend: http://localhost:3000
echo.
echo ⚠️  NO CIERRES ESTA VENTANA
echo Para detener, presiona Ctrl+C
echo.

REM Iniciar backend en segundo plano
start /B cmd /c "cd backend && npm run dev"

REM Esperar 3 segundos
timeout /t 3 /nobreak >nul

REM Iniciar frontend
start /B cmd /c "npm run dev"

REM Esperar 5 segundos y abrir navegador
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo ✅ Aplicación iniciada!
echo 🌐 Abriendo navegador...
echo.
echo Presiona cualquier tecla para detener los servidores...
pause >nul

REM Matar procesos de Node.js (esto detendrá los servidores)
taskkill /F /IM node.exe >nul 2>nul

echo.
echo ✅ Servidores detenidos
timeout /t 2 /nobreak >nul
