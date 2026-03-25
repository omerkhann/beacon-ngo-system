# Beacon NGO Management System - Build & Run Script
# Usage: .\run.ps1

Write-Host "Beacon NGO Management System - Compiling and Running..." -ForegroundColor Cyan

# Clean previous build
if (Test-Path out) {
    Remove-Item -Recurse -Force out
    Write-Host "Cleaned previous build artifacts." -ForegroundColor Gray
}

# Create output directory
New-Item -ItemType Directory -Path out | Out-Null

# Compile
Write-Host "Compiling Java sources..." -ForegroundColor Yellow
$files = Get-ChildItem -Path src/main/java -Recurse -Filter *.java | ForEach-Object { $_.FullName }
javac -cp "lib/*" -d out $files

if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed. Check errors above." -ForegroundColor Red
    exit 1
}

Write-Host "Compilation successful." -ForegroundColor Green

# Run
Write-Host "Launching Beacon application..." -ForegroundColor Yellow
java -cp "out;lib/*" com.beacon.Main

if ($LASTEXITCODE -ne 0) {
    Write-Host "Runtime error. Ensure SQL Server is running and Database is configured." -ForegroundColor Red
    exit 1
}
