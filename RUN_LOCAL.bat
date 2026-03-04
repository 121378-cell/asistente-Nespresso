@echo off
SETLOCAL EnableDelayedExpansion

echo ==========================================
echo   NESPRESSO ASSISTANT - LOCAL RUNNER
echo ==========================================
echo.

:: 1. Docker Check (Opcional)
echo [1/4] Checking Database...
docker --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Docker detected. Starting containers...
    docker compose -f docker-compose.local.yml up -d
) else (
    echo [INFO] Docker not found. Using native PostgreSQL on 5432.
)

:: 2. Dependencies
echo [2/4] Verifying dependencies...
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install --no-audit --no-fund
)
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    call npm --prefix backend install --no-audit --no-fund
)

:: 3. Database Sync
echo [3/4] Syncing Prisma Schema...
call npm --prefix backend run prisma:push
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] No se pudo sincronizar con la DB. 
    echo Asegurate de que PostgreSQL este corriendo en el puerto 5432.
    echo.
    echo Intentando arrancar la app de todos modos...
    timeout /t 5
)

:: 4. Launch Application
echo [4/4] Starting Application...
echo.
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:3001
echo.

:: Configure HMR to use 127.0.0.1 to avoid WebSocket errors on Windows
set VITE_HMR_HOST=127.0.0.1

:: Lanzamos en ventanas separadas con títulos claros
start "Nespresso-API" cmd /c "echo Iniciando API... && npm --prefix backend run dev"
start "Nespresso-Web" cmd /c "echo Iniciando Web... && npm run dev"

echo.
echo ==========================================
echo   LISTO: Revisa las nuevas ventanas
echo ==========================================
echo Nota: Si ves errores de WebSocket, refresca el navegador.
timeout /t 10
exit
