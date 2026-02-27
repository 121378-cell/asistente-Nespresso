# ╔═══════════════════════════════════════════════════════════════════════╗
# ║     Nespresso Assistant - Instalador y Launcher Automático           ║
# ║                                                                       ║
# ║  Este script:                                                        ║
# ║  1. Verifica prerequisitos (Node.js, npm)                           ║
# ║  2. Configura variables de entorno si faltan                        ║
# ║  3. Instala dependencias automáticamente                            ║
# ║  4. Genera cliente Prisma                                           ║
# ║  5. Inicia backend y frontend                                       ║
# ║  6. Abre el navegador automáticamente                               ║
# ╚═══════════════════════════════════════════════════════════════════════╝

$ErrorActionPreference = "Stop"
$originalLocation = Get-Location

# Colors helper
function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  $Text" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Text)
    Write-Host "✅ $Text" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Text)
    Write-Host "⚠️  $Text" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ️  $Text" -ForegroundColor Blue
}

# Función para verificar si un comando existe
function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Función para verificar si estamos en la ruta correcta
function Test-ProjectRoot {
    if (-not (Test-Path "package.json") -or -not (Test-Path "backend")) {
        Write-Error-Custom "Este script debe ejecutarse desde la raíz del proyecto"
        Write-Info "Ubicación actual: $(Get-Location)"
        Write-Info "Navega a la carpeta 'asistente-Nespresso' y ejecuta el script nuevamente"
        return $false
    }
    return $true
}

# Función para instalar dependencias con reintento
function Install-Dependencies {
    param(
        [string]$Path,
        [string]$Name = "Dependencias"
    )
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            Write-Host "⚙️  Instalando $Name (intento $($retryCount + 1) de $maxRetries)..." -ForegroundColor Cyan
            
            $process = Start-Process -FilePath "npm" `
                -ArgumentList @("install", "--loglevel=error") `
                -WorkingDirectory $Path `
                -Wait `
                -PassThru `
                -NoNewWindow
            
            if ($process.ExitCode -eq 0) {
                Write-Success "$Name instaladas correctamente"
                return $true
            }
            
            throw "npm install exited with code $($process.ExitCode)"
        }
        catch {
            $retryCount++
            Write-Warning-Custom "Error instalando $Name: $_"
            
            if ($retryCount -lt $maxRetries) {
                Write-Info "Reintentando en 3 segundos..."
                Start-Sleep -Seconds 3
            } else {
                Write-Error-Custom "No se pudo instalar $Name después de $maxRetries intentos"
                return $false
            }
        }
    }
    
    return $false
}

# ═══════════════════════════════════════════════════════════════════════
# MAIN SCRIPT
# ═══════════════════════════════════════════════════════════════════════

try {
    Write-Header "Nespresso Assistant - Instalador Automático"

    # ═══════════════════════════════════════════════════════════════════
    # 1. Verificar ubicación del script
    # ═══════════════════════════════════════════════════════════════════
    Write-Host "🔍 Verificando ubicación del proyecto..." -ForegroundColor Yellow
    if (-not (Test-ProjectRoot)) {
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    Write-Success "Ubicación correcta verificada"
    Write-Host ""

    # ═══════════════════════════════════════════════════════════════════
    # 2. Verificar Node.js
    # ═══════════════════════════════════════════════════════════════════
    Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
    if (-not (Test-Command "node")) {
        Write-Error-Custom "Node.js no está instalado!"
        Write-Host ""
        Write-Host "Por favor, instala Node.js desde: https://nodejs.org/" -ForegroundColor Cyan
        Write-Host "Recomendamos la versión LTS (Long Term Support)" -ForegroundColor Gray
        Write-Host ""
        
        $install = Read-Host "¿Abrir el sitio web de Node.js? (s/n)"
        if ($install -eq "s" -or $install -eq "y") {
            Start-Process "https://nodejs.org/"
        }
        
        Read-Host "Después de instalar Node.js, presiona Enter para continuar"
        exit 1
    }

    $nodeVersion = node --version
    $nodeMajorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($nodeMajorVersion -lt 18) {
        Write-Error-Custom "Node.js v18 o superior es requerido (tienes $nodeVersion)"
        Write-Host "Por favor, actualiza Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
        Read-Host "Presiona Enter para salir"
        exit 1
    }

    Write-Success "Node.js encontrado: $nodeVersion"
    
    # Verificar npm
    $npmVersion = npm --version
    Write-Success "npm encontrado: v$npmVersion"
    Write-Host ""

    # ═══════════════════════════════════════════════════════════════════
    # 3. Verificar Git (opcional pero recomendado)
    # ═══════════════════════════════════════════════════════════════════
    Write-Host "🔍 Verificando Git..." -ForegroundColor Yellow
    if (Test-Command "git")) {
        $gitVersion = git --version
        Write-Success "Git encontrado: $gitVersion"
    } else {
        Write-Warning-Custom "Git no está instalado (recomendado para control de versiones)"
        Write-Info "Puedes instalarlo desde: https://git-scm.com/"
    }
    Write-Host ""

    # ═══════════════════════════════════════════════════════════════════
    # 4. Configurar variables de entorno del backend
    # ═══════════════════════════════════════════════════════════════════
    Write-Host "🔍 Verificando configuración del backend..." -ForegroundColor Yellow
    if (-not (Test-Path "backend\.env")) {
        Write-Warning-Custom "Archivo backend/.env no encontrado"
        Write-Host ""
        Write-Host "Necesitas configurar la base de datos primero." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Opciones disponibles:" -ForegroundColor White
        Write-Host "  1. Supabase (gratis, en la nube) ⭐ RECOMENDADO" -ForegroundColor Green
        Write-Host "  2. PostgreSQL local" -ForegroundColor Gray
        Write-Host ""
        
        $choice = Read-Host "Elige una opción (1 o 2, por defecto 1)"
        if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }

        $dbUrl = ""

        if ($choice -eq "1") {
            Write-Host ""
            Write-Header "Configuración de Supabase"
            Write-Host "Sigue estos pasos:" -ForegroundColor Cyan
            Write-Host "  1. Ve a https://supabase.com/" -ForegroundColor White
            Write-Host "  2. Crea una cuenta gratuita (o inicia sesión)" -ForegroundColor White
            Write-Host "  3. Haz clic en 'New Project'" -ForegroundColor White
            Write-Host "  4. Rellena:" -ForegroundColor White
            Write-Host "     - Name: nespresso-assistant" -ForegroundColor Gray
            Write-Host "     - Database Password: elige una contraseña segura" -ForegroundColor Gray
            Write-Host "     - Region: elige la más cercana a ti" -ForegroundColor Gray
            Write-Host "  5. Espera a que el proyecto se cree (2-3 minutos)" -ForegroundColor White
            Write-Host "  6. Ve a Settings (⚙️) → Database → Connection String" -ForegroundColor White
            Write-Host "  7. Copia la URL de conexión (modo URI)" -ForegroundColor White
            Write-Host ""
            
            $openSite = Read-Host "¿Abrir Supabase ahora? (s/n)"
            if ($openSite -eq "s" -or $openSite -eq "y") {
                Start-Process "https://supabase.com/"
            }
            
            Write-Host ""
            Write-Host "IMPORTANTE: La URL debe tener este formato:" -ForegroundColor Yellow
            Write-Host "postgresql://postgres.[xxxxx]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres" -ForegroundColor Gray
            Write-Host ""
            
            do {
                $dbUrl = Read-Host "Pega tu DATABASE_URL de Supabase"
                if ([string]::IsNullOrWhiteSpace($dbUrl)) {
                    Write-Error-Custom "La URL no puede estar vacía"
                } elseif ($dbUrl -notmatch "^postgresql://") {
                    Write-Error-Custom "La URL debe comenzar con 'postgresql://'"
                }
            } while ([string]::IsNullOrWhiteSpace($dbUrl) -or $dbUrl -notmatch "^postgresql://")

        } elseif ($choice -eq "2") {
            Write-Host ""
            Write-Host "Para PostgreSQL local, necesitas:" -ForegroundColor Cyan
            Write-Host "  1. Instalar PostgreSQL desde: https://www.postgresql.org/download/" -ForegroundColor White
            Write-Host "  2. Crear una base de datos llamada 'nespresso_assistant'" -ForegroundColor White
            Write-Host "  3. Usar credenciales de tu usuario PostgreSQL" -ForegroundColor White
            Write-Host ""
            
            $defaultUrl = "postgresql://postgres:postgres@localhost:5432/nespresso_assistant"
            Write-Host "URL por defecto:" -ForegroundColor Yellow
            Write-Host "  $defaultUrl" -ForegroundColor Gray
            Write-Host ""
            
            $dbUrlInput = Read-Host "Pega tu URL (o presiona Enter para usar la de arriba)"
            $dbUrl = if ([string]::IsNullOrWhiteSpace($dbUrlInput)) { $defaultUrl } else { $dbUrlInput }
        } else {
            Write-Error-Custom "Opción no válida"
            Read-Host "Presiona Enter para salir"
            exit 1
        }

        # Crear archivo .env del backend
        $envContent = @"
# ═══════════════════════════════════════════════════════════════════════
# Nespresso Assistant - Backend Configuration
# ═══════════════════════════════════════════════════════════════════════

# Database Connection (Required)
DATABASE_URL="$dbUrl"

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Supabase (if using for auth/storage)
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_SERVICE_KEY=your_service_key

# Optional: JWT Secret (change in production)
JWT_SECRET=your-secret-key-change-in-production

# Optional: LLM Provider (gemini or ollama)
LLM_PROVIDER=gemini
OLLAMA_MODEL=llama3
"@
        
        [System.IO.File]::WriteAllText("$PWD\backend\.env", $envContent)
        Write-Success "Configuración del backend guardada en backend\.env"
        
        # Ejecutar migraciones de Prisma
        Write-Host ""
        Write-Host "🔧 Configurando base de datos con Prisma..." -ForegroundColor Cyan
        Set-Location backend
        try {
            npx prisma generate 2>&1 | Out-Null
            Write-Success "Cliente Prisma generado"
            
            npx prisma migrate dev --name init 2>&1 | Out-Null
            Write-Success "Migraciones aplicadas"
        } catch {
            Write-Warning-Custom "Error configurando Prisma: $_"
            Write-Info "Puedes ejecutar 'npm run prisma:migrate' manualmente más tarde"
        }
        Set-Location $originalLocation
    } else {
        Write-Success "backend\.env ya existe"
    }
    Write-Host ""

    # ═══════════════════════════════════════════════════════════════════
    # 5. Configurar variables de entorno del frontend
    # ═══════════════════════════════════════════════════════════════════
    Write-Host "🔍 Verificando configuración del frontend..." -ForegroundColor Yellow
    if (-not (Test-Path ".env.local")) {
        Write-Warning-Custom "Archivo .env.local no encontrado"
        Write-Host ""
        Write-Host "Necesitas tu API Key de Google Gemini" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Pasos:" -ForegroundColor White
        Write-Host "  1. Ve a https://aistudio.google.com/apikey" -ForegroundColor Gray
        Write-Host "  2. Inicia sesión con tu cuenta de Google" -ForegroundColor Gray
        Write-Host "  3. Haz clic en 'Create API Key'" -ForegroundColor Gray
        Write-Host "  4. Copia la clave generada" -ForegroundColor Gray
        Write-Host ""
        
        $openSite = Read-Host "¿Abrir Google AI Studio? (s/n)"
        if ($openSite -eq "s" -or $openSite -eq "y") {
            Start-Process "https://aistudio.google.com/apikey"
        }
        
        Write-Host ""
        Write-Host "IMPORTANTE: La API Key es gratuita para uso personal" -ForegroundColor Yellow
        Write-Host "Límites: 60 requests/minuto, 1500 requests/día" -ForegroundColor Gray
        Write-Host ""
        
        do {
            $apiKey = Read-Host "Pega tu GEMINI_API_KEY"
            if ([string]::IsNullOrWhiteSpace($apiKey)) {
                Write-Error-Custom "La API Key no puede estar vacía"
            } elseif ($apiKey.Length -lt 20) {
                Write-Error-Custom "La API Key parece inválida (demasiado corta)"
            }
        } while ([string]::IsNullOrWhiteSpace($apiKey) -or $apiKey.Length -lt 20)

        $envContent = @"
# ═══════════════════════════════════════════════════════════════════════
# Nespresso Assistant - Frontend Configuration
# ═══════════════════════════════════════════════════════════════════════

# Backend API URL
VITE_API_URL=http://localhost:3001

# Google Gemini API Key (Required)
GEMINI_API_KEY=$apiKey

# Optional: Enable dark mode by default
# VITE_DEFAULT_THEME=dark
"@
        
        [System.IO.File]::WriteAllText("$PWD\.env.local", $envContent)
        Write-Success "API Key guardada en .env.local"
    } else {
        Write-Success ".env.local ya existe"
    }
    Write-Host ""

    # ═══════════════════════════════════════════════════════════════════
    # 6. Instalar dependencias del frontend
    # ═══════════════════════════════════════════════════════════════════
    Write-Host "📦 Verificando dependencias del frontend..." -ForegroundColor Yellow
    if (-not (Test-Path "node_modules")) {
        if (-not (Install-Dependencies -Path $PWD -Name "dependencias del frontend")) {
            Write-Error-Custom "Error crítico instalando dependencias del frontend"
            Read-Host "Presiona Enter para salir"
            exit 1
        }
    } else {
        Write-Success "Dependencias del frontend ya instaladas"
        
        # Verificar si hay dependencias desactualizadas
        Write-Host "🔍 Verificando cambios en package.json..." -ForegroundColor Yellow
        $packageLockTime = (Get-Item "package-lock.json").LastWriteTime
        $packageTime = (Get-Item "package.json").LastWriteTime
        if ($packageTime -gt $packageLockTime) {
            Write-Info "package.json ha cambiado, actualizando dependencias..."
            npm install --loglevel=error 2>&1 | Out-Null
            Write-Success "Dependencias actualizadas"
        }
    }
    Write-Host ""

    # ═══════════════════════════════════════════════════════════════════
    # 7. Instalar dependencias del backend
    # ═══════════════════════════════════════════════════════════════════
    Write-Host "📦 Verificando dependencias del backend..." -ForegroundColor Yellow
    if (-not (Test-Path "backend\node_modules")) {
        if (-not (Install-Dependencies -Path "$PWD\backend" -Name "dependencias del backend")) {
            Write-Error-Custom "Error crítico instalando dependencias del backend"
            Read-Host "Presiona Enter para salir"
            exit 1
        }
    } else {
        Write-Success "Dependencias del backend ya instaladas"
        
        # Verificar si hay dependencias desactualizadas
        Write-Host "🔍 Verificando cambios en package.json del backend..." -ForegroundColor Yellow
        $packageLockTime = (Get-Item "backend\package-lock.json").LastWriteTime
        $packageTime = (Get-Item "backend\package.json").LastWriteTime
        if ($packageTime -gt $packageLockTime) {
            Write-Info "package.json ha cambiado, actualizando dependencias..."
            Set-Location backend
            npm install --loglevel=error 2>&1 | Out-Null
            Set-Location $originalLocation
            Write-Success "Dependencias del backend actualizadas"
        }
    }
    Write-Host ""

    # ═══════════════════════════════════════════════════════════════════
    # 8. Generar cliente de Prisma
    # ═══════════════════════════════════════════════════════════════════
    Write-Host "🔧 Verificando cliente de Prisma..." -ForegroundColor Yellow
    Set-Location backend
    try {
        npx prisma generate 2>&1 | Out-Null
        Write-Success "Cliente de Prisma actualizado"
    } catch {
        Write-Warning-Custom "Error generando cliente de Prisma: $_"
        Write-Info "Puedes ejecutar 'npm run prisma:generate' manualmente más tarde"
    }
    Set-Location $originalLocation
    Write-Host ""

    # ═══════════════════════════════════════════════════════════════════
    # 9. Iniciar servidores
    # ═══════════════════════════════════════════════════════════════════
    Write-Header "Iniciando Aplicación"
    
    Write-Host "📊 Backend: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "📊 Prisma Studio: http://localhost:5555 (opcional)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Warning-Custom "IMPORTANTE: NO CIERRES ESTA VENTANA"
    Write-Host "Para detener la aplicación:" -ForegroundColor Yellow
    Write-Host "  1. Cierra esta ventana de PowerShell" -ForegroundColor Gray
    Write-Host "  2. O presiona Ctrl+C aquí" -ForegroundColor Gray
    Write-Host ""
    
    Write-Info "Iniciando servidores en segundo plano..."
    
    # Iniciar backend como job
    $backendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD\backend
        npm run dev 2>&1
    }
    
    # Esperar un momento para que el backend inicie
    Start-Sleep -Seconds 3
    
    # Iniciar frontend como job
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm run dev 2>&1
    }
    
    # Esperar a que el frontend esté listo
    Start-Sleep -Seconds 5
    
    # Abrir navegador
    Write-Success "¡Aplicación iniciada correctamente!"
    Write-Host ""
    Write-Info "Abriendo navegador en http://localhost:3000..."
    Start-Process "http://localhost:3000"
    
    Write-Host ""
    Write-Header "Servidores Corriendo"
    Write-Host "Backend:  http://localhost:3001" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    Write-Host "Presiona Ctrl+C o cierra esta ventana para detener" -ForegroundColor Yellow
    Write-Host ""

    # Mantener el script ejecutándose
    try {
        while ($true) {
            Start-Sleep -Seconds 1
            
            # Verificar si los jobs siguen activos
            if ($backendJob.State -eq "Failed" -or $frontendJob.State -eq "Failed") {
                Write-Error-Custom "Uno de los servidores ha fallado"
                break
            }
        }
    } finally {
        # Limpieza al salir
        Write-Host ""
        Write-Host "🛑 Deteniendo servidores..." -ForegroundColor Yellow
        
        if ($backendJob) {
            Stop-Job $backendJob -ErrorAction SilentlyContinue
            Remove-Job $backendJob -ErrorAction SilentlyContinue
        }
        
        if ($frontendJob) {
            Stop-Job $frontendJob -ErrorAction SilentlyContinue
            Remove-Job $frontendJob -ErrorAction SilentlyContinue
        }
        
        Write-Success "Servidores detenidos"
    }

} catch {
    Write-Error-Custom "Error inesperado: $_"
    Write-Host ""
    Write-Host "Detalles del error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkRed
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}
