# Script para crear un paquete portable de la aplicación
# Este script crea un ZIP con todo lo necesario para ejecutar en otro dispositivo

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Creando Paquete Portable - Nespresso Assistant        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$packageName = "NespressoAssistant-Portable-$(Get-Date -Format 'yyyyMMdd').zip"
$tempDir = ".\temp-package"

# Crear directorio temporal
Write-Host "📁 Creando directorio temporal..." -ForegroundColor Yellow
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copiar archivos necesarios
Write-Host "📦 Copiando archivos..." -ForegroundColor Yellow

$filesToCopy = @(
    "backend",
    "components",
    "data",
    "hooks",
    "services",
    "utils",
    "public",
    "App.tsx",
    "constants.ts",
    "index.html",
    "index.tsx",
    "package.json",
    "tsconfig.json",
    "types.ts",
    "vite.config.ts",
    "START.bat",
    "START.ps1",
    "README.md",
    "SETUP_GUIDE.md",
    "MOBILE_DEPLOYMENT.md",
    "SUPABASE_SETUP.md",
    ".env.example",
    ".gitignore"
)

foreach ($item in $filesToCopy) {
    if (Test-Path $item) {
        Write-Host "  ✓ $item" -ForegroundColor Green
        Copy-Item $item -Destination $tempDir -Recurse -Force
    }
}

# Crear archivo de instrucciones
Write-Host "📝 Creando instrucciones..." -ForegroundColor Yellow
$instructions = @"
╔════════════════════════════════════════════════════════════╗
║     Nespresso Assistant - Paquete Portable                ║
╚════════════════════════════════════════════════════════════╝

REQUISITOS:
-----------
1. Node.js v18 o superior
   Descargar: https://nodejs.org/

2. Base de datos PostgreSQL
   Opción A (Recomendado): Supabase (gratis)
   - Crear cuenta en: https://supabase.com/
   - Seguir instrucciones en SUPABASE_SETUP.md
   
   Opción B: PostgreSQL local
   - Descargar: https://www.postgresql.org/download/

3. API Key de Gemini (gratis)
   Obtener en: https://aistudio.google.com/apikey

INSTALACIÓN:
------------
1. Extraer este ZIP en una carpeta
2. Doble clic en START.ps1
3. Seguir las instrucciones en pantalla
4. ¡Listo!

INICIO RÁPIDO:
--------------
Una vez configurado, simplemente:
- Doble clic en START.bat
- La aplicación se abrirá automáticamente

DOCUMENTACIÓN:
--------------
- README.md - Guía completa
- SETUP_GUIDE.md - Configuración paso a paso
- MOBILE_DEPLOYMENT.md - Acceso desde móvil
- SUPABASE_SETUP.md - Configurar Supabase

SOPORTE:
--------
Para problemas o preguntas, consulta README.md
sección "Solución de Problemas"

¡Disfruta tu asistente Nespresso!
"@

$instructions | Out-File -FilePath "$tempDir\LEEME.txt" -Encoding UTF8

# Crear el ZIP
Write-Host "🗜️  Comprimiendo archivos..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir\*" -DestinationPath $packageName -Force

# Limpiar
Write-Host "🧹 Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item $tempDir -Recurse -Force

# Resultado
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ Paquete Creado Exitosamente                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Archivo: $packageName" -ForegroundColor Cyan
Write-Host "📊 Tamaño: $([math]::Round((Get-Item $packageName).Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Puedes compartir este archivo con cualquier persona" -ForegroundColor Yellow
Write-Host "   Solo necesitan Node.js instalado para ejecutarlo" -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 Para acceso móvil, consulta MOBILE_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""

Read-Host "Presiona Enter para salir"
