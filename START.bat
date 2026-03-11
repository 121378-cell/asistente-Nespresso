@echo off
title Nespresso Assistant - Launcher

echo.
echo ==========================================
echo    Nespresso Assistant - Iniciador
echo ==========================================
echo.

:: 1. Configurar acceso movil (IP automatica)
echo [1/3] Configurando red y acceso movil...
node scripts/mobile-setup.js
if %ERRORLEVEL% NEQ 0 (
    echo Error en mobile-setup.js
)

:: 2. Verificar dependencias
if not exist "node_modules" (
    echo [2/3] Instalando dependencias frontend...
    call npm install --loglevel=error
)
if not exist "backend\node_modules" (
    echo [2/3] Instalando dependencias backend...
    cd backend && call npm install --loglevel=error && cd ..
)

:: 3. Generar Prisma Client
if not exist "backend\prisma\client" (
    echo [2/3] Generando Prisma Client...
    cd backend && call npx prisma generate && cd ..
)

:: 4. Iniciar servidores
echo.
echo [3/3] Iniciando servidores...
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.

:: Iniciar backend en segundo plano
start /B cmd /c "cd backend && npm run dev"

:: Esperar un poco
timeout /t 5 /nobreak >nul

:: Iniciar frontend
npm run dev
