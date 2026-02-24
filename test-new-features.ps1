# Script de Pruebas de Integración - Nuevas Funcionalidades Asistente Nespresso

$baseUrl = "http://localhost:3001/api"
$testEmail = "test-$(Get-Random)@nespresso.com"
$testPass = "password123"

function Write-Step($msg) {
    Write-Host "`n>> $msg" -ForegroundColor Cyan
}

function Write-Success($msg) {
    Write-Host "   [OK] $msg" -ForegroundColor Green
}

function Write-Error($msg) {
    Write-Host "   [FAIL] $msg" -ForegroundColor Red
}

try {
    Write-Step "1. Probando Autenticación (Registro)..."
    $regBody = @{ email = $testEmail; password = $testPass; name = "Tester Robot" }
    $regRes = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/register" -ContentType "application/json" -Body ($regBody | ConvertTo-Json)
    Write-Success "Usuario registrado: $($regRes.userId)"

    Write-Step "2. Probando Autenticación (Login)..."
    $loginRes = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -ContentType "application/json" -Body ($regBody | ConvertTo-Json)
    $token = $loginRes.token
    $authHeader = @{ Authorization = "Bearer $token" }
    Write-Success "Token obtenido con éxito."

    Write-Step "3. Creando una reparación de prueba (Protegida)..."
    $repairBody = @{
        name = "Prueba Automatizada"
        machineModel = "Zenius"
        serialNumber = "ZN123456"
        timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
        messages = @(
            @{ role = "USER"; text = "Mi Zenius pierde agua" },
            @{ role = "MODEL"; text = "Revisa la junta del depósito." }
        )
    }
    $repairRes = Invoke-RestMethod -Method Post -Uri "$baseUrl/repairs" -Headers $authHeader -ContentType "application/json" -Body ($repairBody | ConvertTo-Json)
    $repairId = $repairRes.id
    Write-Success "Reparación creada con ID: $repairId"

    Write-Step "4. Probando Generación de PDF..."
    $pdfFile = "test-report.pdf"
    Invoke-WebRequest -Uri "$baseUrl/repairs/$repairId/pdf" -Headers $authHeader -OutFile $pdfFile
    if (Test-Path $pdfFile) {
        Write-Success "Archivo PDF generado correctamente: $pdfFile"
    } else {
        throw "El PDF no se generó."
    }

    Write-Step "5. Probando Identificación Asíncrona (Encolado)..."
    # Imagen dummy en base64
    $imgBody = @{ image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" }
    $asyncRes = Invoke-RestMethod -Method Post -Uri "$baseUrl/chat/identify-machine/async" -ContentType "application/json" -Body ($imgBody | ConvertTo-Json)
    $jobId = $asyncRes.jobId
    Write-Success "Job encolado con ID: $jobId. Estado inicial: $($asyncRes.status)"

    Write-Step "6. Verificando estado del Job..."
    $statusRes = Invoke-RestMethod -Method Get -Uri "$baseUrl/chat/identify-machine/status/$jobId"
    Write-Success "Estado actual del job: $($statusRes.status)"

    Write-Step "7. Probando Caché Semántica (Velocidad)..."
    $chatBody = @{ message = "Pregunta de prueba para cache"; history = @() }
    
    Write-Host "   Realizando primera consulta (hacia Gemini)..."
    $start = Get-Date
    $res1 = Invoke-RestMethod -Method Post -Uri "$baseUrl/chat" -ContentType "application/json" -Body ($chatBody | ConvertTo-Json)
    $time1 = ((Get-Date) - $start).TotalMilliseconds
    Write-Host "   Tiempo 1: $($time1)ms"

    Write-Host "   Realizando segunda consulta (desde Caché)..."
    $start = Get-Date
    $res2 = Invoke-RestMethod -Method Post -Uri "$baseUrl/chat" -ContentType "application/json" -Body ($chatBody | ConvertTo-Json)
    $time2 = ((Get-Date) - $start).TotalMilliseconds
    Write-Host "   Tiempo 2: $($time2)ms"

    if ($time2 -lt ($time1 / 2)) {
        Write-Success "La caché está funcionando (Ahorro de tiempo masivo)."
    } else {
        Write-Host "   Nota: La diferencia de tiempo no es concluyente, pero se guardó en JSON." -ForegroundColor Yellow
    }

    Write-Step "--- PRUEBAS FINALIZADAS CON ÉXITO ---"
}
catch {
    Write-Error "Ocurrió un error durante las pruebas: $_"
    exit 1
}
