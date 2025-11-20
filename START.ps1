# Nespresso Assistant - Launcher
# Este script instala dependencias y ejecuta la aplicación automáticamente

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Nespresso Assistant - Instalador Automático           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Función para verificar si un comando existe
function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js no está instalado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Descarga la versión LTS (recomendada)" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para abrir el sitio web de Node.js"
    Start-Process "https://nodejs.org/"
    Read-Host "Después de instalar Node.js, presiona Enter para continuar"
    exit
}

$nodeVersion = node --version
Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Verificar si .env existe
Write-Host "🔍 Verificando configuración..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  Archivo backend/.env no encontrado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Necesitas configurar la base de datos primero." -ForegroundColor Yellow
    Write-Host "Opciones:" -ForegroundColor Cyan
    Write-Host "  1. Usar Supabase (gratis, en la nube)" -ForegroundColor White
    Write-Host "  2. Instalar PostgreSQL localmente" -ForegroundColor White
    Write-Host ""
    $choice = Read-Host "Elige una opción (1 o 2)"
    
    if ($choice -eq "1") {
        Write-Host ""
        Write-Host "📋 Pasos para configurar Supabase:" -ForegroundColor Cyan
        Write-Host "  1. Ve a https://supabase.com/" -ForegroundColor White
        Write-Host "  2. Crea una cuenta gratuita" -ForegroundColor White
        Write-Host "  3. Crea un nuevo proyecto" -ForegroundColor White
        Write-Host "  4. Ve a Settings → Database → Connection String → URI" -ForegroundColor White
        Write-Host "  5. Copia la URL de conexión" -ForegroundColor White
        Write-Host ""
        Start-Process "https://supabase.com/"
        Write-Host "Pega aquí tu URL de conexión de Supabase:" -ForegroundColor Yellow
        $dbUrl = Read-Host
        
        # Crear archivo .env
        $envContent = @"
DATABASE_URL=$dbUrl
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
"@
        [System.IO.File]::WriteAllText("$PWD\backend\.env", $envContent)
        Write-Host "✅ Configuración guardada" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Para PostgreSQL local, usa esta URL:" -ForegroundColor Yellow
        Write-Host "postgresql://postgres:postgres@localhost:5432/nespresso_assistant" -ForegroundColor White
        Write-Host ""
        $dbUrl = Read-Host "Pega tu URL de PostgreSQL (o presiona Enter para usar la de arriba)"
        if ([string]::IsNullOrWhiteSpace($dbUrl)) {
            $dbUrl = "postgresql://postgres:postgres@localhost:5432/nespresso_assistant"
        }
        
        $envContent = @"
DATABASE_URL=$dbUrl
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
"@
        [System.IO.File]::WriteAllText("$PWD\backend\.env", $envContent)
        Write-Host "✅ Configuración guardada" -ForegroundColor Green
    }
    Write-Host ""
}

if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Archivo .env.local no encontrado" -ForegroundColor Yellow
    Write-Host "Necesitas tu API Key de Gemini" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Si no tienes una, obtén una gratis en: https://aistudio.google.com/apikey" -ForegroundColor Cyan
    $openSite = Read-Host "¿Abrir el sitio ahora? (s/n)"
    if ($openSite -eq "s") {
        Start-Process "https://aistudio.google.com/apikey"
    }
    Write-Host ""
    $apiKey = Read-Host "Pega tu GEMINI_API_KEY aquí"
    
    $envContent = @"
VITE_API_URL=http://localhost:3001
GEMINI_API_KEY=$apiKey
"@
    [System.IO.File]::WriteAllText("$PWD\.env.local", $envContent)
    Write-Host "✅ API Key guardada" -ForegroundColor Green
    Write-Host ""
}

# Verificar dependencias del frontend
Write-Host "📦 Verificando dependencias del frontend..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "⚙️  Instalando dependencias del frontend..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error instalando dependencias del frontend" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit
    }
    Write-Host "✅ Dependencias del frontend instaladas" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencias del frontend ya instaladas" -ForegroundColor Green
}
Write-Host ""

# Verificar dependencias del backend
Write-Host "📦 Verificando dependencias del backend..." -ForegroundColor Yellow
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "⚙️  Instalando dependencias del backend..." -ForegroundColor Cyan
    Set-Location backend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error instalando dependencias del backend" -ForegroundColor Red
        Set-Location ..
        Read-Host "Presiona Enter para salir"
        exit
    }
    Set-Location ..
    Write-Host "✅ Dependencias del backend instaladas" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencias del backend ya instaladas" -ForegroundColor Green
}
Write-Host ""

# Generar cliente de Prisma
Write-Host "🔧 Generando cliente de Prisma..." -ForegroundColor Yellow
Set-Location backend
npx prisma generate 2>&1 | Out-Null
Set-Location ..
Write-Host "✅ Cliente de Prisma generado" -ForegroundColor Green
Write-Host ""

# Iniciar servidores
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              🚀 Iniciando Aplicación...                    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Backend iniciando en http://localhost:3001" -ForegroundColor Cyan
Write-Host "🌐 Frontend iniciando en http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: NO CIERRES ESTA VENTANA" -ForegroundColor Yellow
Write-Host "Para detener la aplicación, presiona Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Crear script temporal para ejecutar ambos servidores
$runScript = @'
$backend = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    npm run dev
}

$frontend = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host "✅ Aplicación iniciada!" -ForegroundColor Green
Write-Host "🌐 Abriendo navegador..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener los servidores" -ForegroundColor Yellow

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Stop-Job $backend, $frontend
    Remove-Job $backend, $frontend
}
'@

Invoke-Expression $runScript
