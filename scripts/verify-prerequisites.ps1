# Nespresso Assistant - Prerequisites Verification Script
# Este script verifica que todos los prerequisitos esten instalados

$ErrorActionPreference = "Continue"

function Write-Success {
    param([string]$Text)
    Write-Host "OK $Text" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Text)
    Write-Host "ERROR $Text" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Text)
    Write-Host "WARN $Text" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Text)
    Write-Host "INFO $Text" -ForegroundColor Blue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verificacion de Prerequisitos        "
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true
$warnings = 0

# 1. Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCommand) {
    $nodeVersion = node --version 2>&1
    $nodeMajorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($nodeMajorVersion -ge 18) {
        Write-Success "Node.js $nodeVersion instalado"
    } else {
        Write-Error-Custom "Node.js $nodeVersion encontrado (se requiere v18+)"
        Write-Info "Descarga la version LTS desde: https://nodejs.org/"
        $allPassed = $false
    }
} else {
    Write-Error-Custom "Node.js no esta instalado"
    Write-Info "Descarga desde: https://nodejs.org/"
    $allPassed = $false
}

Write-Host ""

# 2. Verificar npm
Write-Host "Verificando npm..." -ForegroundColor Yellow

$npmCommand = Get-Command npm -ErrorAction SilentlyContinue
if ($npmCommand) {
    $npmVersion = npm --version 2>&1
    Write-Success "npm v$npmVersion instalado"
} else {
    Write-Error-Custom "npm no esta disponible"
    Write-Info "Reinstala Node.js desde: https://nodejs.org/"
    $allPassed = $false
}

Write-Host ""

# 3. Verificar Git (opcional)
Write-Host "Verificando Git..." -ForegroundColor Yellow

$gitCommand = Get-Command git -ErrorAction SilentlyContinue
if ($gitCommand) {
    $gitVersion = git --version 2>&1
    Write-Success "Git $gitVersion instalado"
} else {
    Write-Warning-Custom "Git no esta instalado (recomendado)"
    Write-Info "Descarga desde: https://git-scm.com/"
    $warnings++
}

Write-Host ""

# 4. Verificar archivos de configuracion
Write-Host "Verificando archivos de configuracion..." -ForegroundColor Yellow

if (Test-Path "backend\.env") {
    Write-Success "backend\.env encontrado"
} else {
    Write-Warning-Custom "backend\.env no encontrado (se creara en el setup)"
    $warnings++
}

if (Test-Path ".env.local") {
    Write-Success ".env.local encontrado"
} else {
    Write-Warning-Custom ".env.local no encontrado (se creara en el setup)"
    $warnings++
}

Write-Host ""

# 5. Verificar dependencias instaladas
Write-Host "Verificando dependencias..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Success "Dependencias frontend instaladas"
} else {
    Write-Warning-Custom "Dependencias frontend no instaladas"
    $warnings++
}

if (Test-Path "backend\node_modules") {
    Write-Success "Dependencias backend instaladas"
} else {
    Write-Warning-Custom "Dependencias backend no instaladas"
    $warnings++
}

Write-Host ""

# 6. Verificar estructura del proyecto
Write-Host "Verificando estructura del proyecto..." -ForegroundColor Yellow

$requiredFiles = @(
    "package.json",
    "backend\package.json",
    "backend\prisma\schema.prisma",
    "START.bat",
    "START.ps1"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "$file encontrado"
    } else {
        Write-Error-Custom "$file no encontrado"
        $allPassed = $false
    }
}

Write-Host ""

# RESULTADO
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resultado                            "
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($allPassed -and $warnings -eq 0) {
    Write-Success "Todos los prerequisitos estan listos!"
    Write-Host ""
    Write-Host "Puedes ejecutar la aplicacion con:" -ForegroundColor Cyan
    Write-Host "  .\START.bat" -ForegroundColor White
    Write-Host ""
    exit 0
} elseif ($allPassed -and $warnings -gt 0) {
    Write-Success "Prerequisitos principales listos"
    Write-Warning-Custom "$warnings advertencia(s) encontrada(s)"
    Write-Host ""
    Write-Host "Puedes ejecutar .\START.ps1 para configuracion completa" -ForegroundColor Yellow
    Write-Host ""
    exit 0
} else {
    Write-Error-Custom "Faltan prerequisitos criticos"
    Write-Host ""
    Write-Host "Instala lo siguiente:" -ForegroundColor Red
    Write-Host "  1. Node.js v18+ desde: https://nodejs.org/" -ForegroundColor White
    Write-Host ""
    exit 1
}
