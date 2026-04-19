# Beacon NGO Management System - JavaFX Application Launcher
# Simple one-command build and run script

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Beacon NGO Management System - JavaFX Edition" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Step 1: Load database config
$envFile = "db.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) { return }
        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim().Trim('"'), "Process")
        }
    }
    Write-Host "[OK] Database config loaded" -ForegroundColor Green
}

# Step 2: Find JDBC driver
$jdbcJar = Get-ChildItem -Path lib -Filter "mssql-jdbc*.jar" -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending | Select-Object -First 1
if (-not $jdbcJar) {
    Write-Host "[ERROR] JDBC driver not found in lib/ folder" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Found JDBC: $($jdbcJar.Name)" -ForegroundColor Green

# Step 3: Find JavaFX SDK
$javafxBase = Get-ChildItem -Path lib -Directory -Filter "javafx-*" -ErrorAction SilentlyContinue |
    Sort-Object Name | Select-Object -First 1
if (-not $javafxBase) {
    Write-Host "[ERROR] JavaFX SDK not found in lib/ folder" -ForegroundColor Red
    exit 1
}
$JAVAFX = Resolve-Path $javafxBase.FullName
if (-not (Test-Path "$JAVAFX\lib")) {
    Write-Host "[ERROR] JavaFX lib folder not found at: $JAVAFX\lib" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Found JavaFX: $($javafxBase.Name)" -ForegroundColor Green

# Step 4: Compile
Write-Host "`n[STEP] Compiling Java sources..." -ForegroundColor Yellow
Remove-Item -Path "out" -Recurse -Force -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Path out | Out-Null

$files = Get-ChildItem -Path "src/main/java" -Recurse -Filter "*.java" | ForEach-Object { $_.FullName }
$jdbcPath = Join-Path "lib" $jdbcJar.Name
& javac --module-path "$JAVAFX\lib" --add-modules javafx.controls,javafx.fxml -cp "$jdbcPath;." -d out $files

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Compilation failed" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Compilation successful" -ForegroundColor Green

# Step 5: Copy CSS resources
New-Item -ItemType Directory -Path "out\styles" -Force -ErrorAction SilentlyContinue | Out-Null
Copy-Item "src\main\resources\styles\beacon.css" "out\styles\" -Force -ErrorAction SilentlyContinue
Write-Host "[OK] Resources copied" -ForegroundColor Green

# Step 6: Launch
Write-Host "`n[STEP] Launching Beacon application..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

& java --module-path "$JAVAFX\lib" --add-modules javafx.controls,javafx.fxml -cp "out;$jdbcPath" com.beacon.Main

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Runtime error occurred" -ForegroundColor Red
    exit 1
}
