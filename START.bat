@echo off
chcp 65001 >nul
title Nespresso Assistant - Launcher

REM ═══════════════════════════════════════════════════════════════════════
REM  Nespresso Assistant - Launcher Rápido
REM  
REM  Este script:
REM  1. Verifica Node.js instalado
REM  2. Verifica configuración (.env files)
REM  3. Instala dependencias si es necesario
REM  4. Inicia backend y frontend
REM  5. Abre el navegador automáticamente
REM ═══════════════════════════════════════════════════════════════════════

echo.
echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║     Nespresso Assistant - Iniciador Rápido                           ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.

REM ═══════════════════════════════════════════════════════════════════════
REM  1. Verificar Node.js
REM ═══════════════════════════════════════════════════════════════════════

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no está instalado!
    echo.
    echo Requisitos mínimos:
    echo   - Node.js v18 o superior
    echo   - npm (incluido con Node.js)
    echo.
    echo 1) Instala Node.js desde: https://nodejs.org/
    echo 2) Ejecuta este script nuevamente después de instalar
    echo.
    
    set /p open="¿Abrir sitio web de Node.js? (s/n): "
    if /i "%open%"=="s" start https://nodejs.org/
    
    pause
    exit /b 1
)

REM Verificar versión de Node.js
for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js encontrado: %NODE_VERSION%

REM Verificar npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm no está disponible
    echo.
    echo Reinstala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=1" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm encontrado: v%NPM_VERSION%
echo.

REM ═══════════════════════════════════════════════════════════════════════
REM  2. Verificar archivos de configuración
REM ═══════════════════════════════════════════════════════════════════════

if not exist "backend\.env" (
    echo ⚠️  Archivo backend\.env no encontrado
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo  PRIMERA VEZ - Configuración necesaria
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo Opciones:
    echo.
    echo   1. Ejecutar START.ps1 para configuración guiada
    echo      (Recomendado - configura todo automáticamente)
    echo.
    echo   2. Configurar manualmente:
    echo      a) Copia backend\.env.example a backend\.env
    echo      b) Edita backend\.env con tu DATABASE_URL
    echo      c) Copia .env.example a .env.local
    echo      d) Edita .env.local con tu GEMINI_API_KEY
    echo.
    
    set /p runps1="¿Ejecutar START.ps1 ahora? (s/n): "
    if /i "%runps1%"=="s" (
        echo.
        echo Iniciando configuración guiada...
        powershell -ExecutionPolicy Bypass -File START.ps1
        if %ERRORLEVEL% NEQ 0 (
            echo.
            echo ❌ Error en la configuración guiada
            echo.
            pause
            exit /b 1
        )
        REM Reiniciar el script después de la configuración
        goto :EOF
    ) else (
        echo.
        echo Instrucciones manuales:
        echo   1. Abre backend\.env.example y copia el contenido
        echo   2. Crea backend\.env y pega el contenido
        echo   3. Añade tu DATABASE_URL de Supabase/PostgreSQL
        echo   4. Repite para .env.local con tu GEMINI_API_KEY
        echo.
        pause
        exit /b 1
    )
)

if not exist ".env.local" (
    echo ⚠️  Archivo .env.local no encontrado
    echo.
    echo Por favor, ejecuta START.ps1 para configuración guiada
    echo O crea .env.local basado en .env.example
    echo.
    
    set /p runps1="¿Ejecutar START.ps1 ahora? (s/n): "
    if /i "%runps1%"=="s" (
        powershell -ExecutionPolicy Bypass -File START.ps1
        if %ERRORLEVEL% NEQ 0 (
            echo.
            echo ❌ Error en la configuración
            pause
            exit /b 1
        )
        goto :EOF
    ) else (
        pause
        exit /b 1
    )
)

echo ✅ Configuración encontrada
echo.

REM ═══════════════════════════════════════════════════════════════════════
REM  3. Verificar e instalar dependencias
REM ═══════════════════════════════════════════════════════════════════════

if not exist "node_modules" (
    echo 📦 Instalando dependencias del frontend...
    echo    Esto puede tomar 1-2 minutos la primera vez
    echo.
    call npm install --loglevel=error
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ Error instalando dependencias del frontend
        echo    Ejecuta 'npm install' manualmente para ver detalles
        echo.
        pause
        exit /b 1
    )
    echo ✅ Dependencias del frontend instaladas
    echo.
) else (
    REM Verificar si package.json es más reciente que node_modules
    if exist "package.json" (
        for %%A in (package.json) do set PKG_TIME=%%~tA
        for %%A in (node_modules) do set NODE_MOD_TIME=%%~tA
        if "%PKG_TIME%" GTR "%NODE_MOD_TIME%" (
            echo 🔄 Actualizando dependencias del frontend...
            call npm install --loglevel=error 2>&1 | findstr /v /c:"npm WARN"
            echo ✅ Dependencias actualizadas
            echo.
        )
    )
)

if not exist "backend\node_modules" (
    echo 📦 Instalando dependencias del backend...
    echo    Esto puede tomar 1-2 minutos la primera vez
    echo.
    cd backend
    call npm install --loglevel=error
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ Error instalando dependencias del backend
        cd ..
        echo    Ejecuta 'cd backend ^&^& npm install' para ver detalles
        echo.
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Dependencias del backend instaladas
    echo.
) else (
    REM Verificar si package.json del backend es más reciente
    if exist "backend\package.json" (
        for %%A in (backend\package.json) do set PKG_TIME=%%~tA
        for %%A in (backend\node_modules) do set NODE_MOD_TIME=%%~tA
        if "%PKG_TIME%" GTR "%NODE_MOD_TIME%" (
            echo 🔄 Actualizando dependencias del backend...
            cd backend
            call npm install --loglevel=error 2>&1 | findstr /v /c:"npm WARN"
            cd ..
            echo ✅ Dependencias actualizadas
            echo.
        )
    )
)

REM Generar cliente Prisma si es necesario
if not exist "backend\prisma\client" (
    echo 🔧 Generando cliente de Prisma...
    cd backend
    call npx prisma generate --loglevel=error 2>&1 | findstr /v /c:"npm WARN"
    cd ..
    echo ✅ Cliente de Prisma generado
    echo.
)

REM ═══════════════════════════════════════════════════════════════════════
REM  4. Iniciar servidores
REM ═══════════════════════════════════════════════════════════════════════

echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║              🚀 Iniciando Aplicación...                               ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.
echo 📊 Backend:  http://localhost:3001
echo 🌐 Frontend: http://localhost:3000
echo 📊 Prisma:   http://localhost:5555 (opcional)
echo.
echo ⚠️  IMPORTANTE: NO CIERRES ESTA VENTANA
echo.
echo Para detener la aplicación:
echo   1. Cierra esta ventana, O
echo   2. Presiona Ctrl+C
echo.
echo ℹ️  Los servidores se están iniciando...
echo.

REM Iniciar backend en ventana separada (oculta)
start /B cmd /c "cd backend && echo Iniciando backend... && npm run dev"

REM Esperar a que el backend esté listo
echo    Esperando backend (3 segundos)...
timeout /t 3 /nobreak >nul

REM Verificar si el backend inició correctamente
netstat -ano | findstr ":3001" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  El backend no parece estar corriendo en el puerto 3001
    echo    Revisa la ventana del backend para errores
    echo.
    set /p continue="¿Continuar de todos modos? (s/n): "
    if /i not "%continue%"=="s" (
        taskkill /F /IM node.exe >nul 2>nul
        pause
        exit /b 1
    )
)

REM Iniciar frontend en ventana separada
start /B cmd /c "echo Iniciando frontend... && npm run dev"

REM Esperar a que el frontend esté listo
echo    Esperando frontend (5 segundos)...
timeout /t 5 /nobreak >nul

REM Abrir navegador
echo.
echo ✅ ¡Aplicación iniciada correctamente!
echo 🌐 Abriendo navegador...
echo.
start http://localhost:3000

echo ═══════════════════════════════════════════════════════════════════════
echo  Servidores corriendo
echo ═══════════════════════════════════════════════════════════════════════
echo.
echo  Backend:  http://localhost:3001  ✅
echo  Frontend: http://localhost:3000  ✅
echo.
echo  Presiona Ctrl+C o cierra esta ventana para detener
echo.

REM Mantener la ventana abierta
pause >nul

REM ═══════════════════════════════════════════════════════════════════════
REM  5. Limpieza al salir
REM ═══════════════════════════════════════════════════════════════════════

echo.
echo 🛑 Deteniendo servidores...
echo.

REM Matar procesos de Node.js relacionados con el proyecto
taskkill /F /IM node.exe >nul 2>nul

echo ✅ Servidores detenidos
echo.
timeout /t 1 /nobreak >nul
echo ¡Hasta luego!
timeout /t 1 /nobreak >nul
