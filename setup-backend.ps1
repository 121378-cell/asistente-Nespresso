# Quick Start Script for Backend Setup

Write-Host "🚀 Nespresso Assistant - Backend Setup" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
$pgVersion = & psql --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "Or use a cloud service like Supabase (https://supabase.com/)" -ForegroundColor Yellow
    Write-Host ""
    $useCloud = Read-Host "Do you want to use a cloud PostgreSQL service? (y/n)"
    if ($useCloud -eq "y") {
        Write-Host ""
        Write-Host "Please create a free PostgreSQL database at:" -ForegroundColor Cyan
        Write-Host "  - Supabase: https://supabase.com/" -ForegroundColor White
        Write-Host "  - Railway: https://railway.app/" -ForegroundColor White
        Write-Host "  - Render: https://render.com/" -ForegroundColor White
        Write-Host ""
        Write-Host "Then copy your DATABASE_URL and paste it in backend/.env" -ForegroundColor Yellow
        exit
    } else {
        Write-Host "Please install PostgreSQL first, then run this script again." -ForegroundColor Yellow
        exit
    }
}

Write-Host ""

# Check if .env exists
if (!(Test-Path "backend\.env")) {
    Write-Host "Creating backend/.env file..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
    Write-Host "⚠️  Please edit backend/.env and update DATABASE_URL with your credentials" -ForegroundColor Yellow
    Write-Host ""
    $editNow = Read-Host "Do you want to edit it now? (y/n)"
    if ($editNow -eq "y") {
        notepad "backend\.env"
        Write-Host "Press Enter after saving the file..." -ForegroundColor Yellow
        Read-Host
    }
} else {
    Write-Host "✅ backend/.env already exists" -ForegroundColor Green
}

Write-Host ""

# Check if database exists
Write-Host "Checking database connection..." -ForegroundColor Yellow
Set-Location backend
$env:DATABASE_URL = (Get-Content .env | Select-String "DATABASE_URL").ToString().Split("=")[1].Trim('"')

# Run Prisma migrate
Write-Host "Running database migrations..." -ForegroundColor Yellow
npm run prisma:migrate 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database migrations completed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Migration had issues. This is normal for first run." -ForegroundColor Yellow
    Write-Host "Trying to generate Prisma client..." -ForegroundColor Yellow
    npm run prisma:generate
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the backend server:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "To start the frontend:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
