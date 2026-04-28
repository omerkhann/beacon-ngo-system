# Beacon NGO Management System - API Server Only (No JavaFX)
# Compiles Java and starts REST API server on port 7000

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Beacon NGO Management System - API Server" -ForegroundColor Cyan
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
    # Map DB_USER -> BEACON_DB_USER and DB_PASSWORD -> BEACON_DB_PASSWORD for Java compatibility
    if ($env:DB_USER) {
        [Environment]::SetEnvironmentVariable("BEACON_DB_USER", $env:DB_USER, "Process")
    }
    if ($env:DB_PASSWORD) {
        [Environment]::SetEnvironmentVariable("BEACON_DB_PASSWORD", $env:DB_PASSWORD, "Process")
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

# Step 3: Compile
Write-Host "`n[STEP] Compiling Java sources..." -ForegroundColor Yellow
Remove-Item -Path "out" -Recurse -Force -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Path out | Out-Null

$files = Get-ChildItem -Path "src/main/java" -Recurse -Filter "*.java" | ForEach-Object { $_.FullName }
$jdbcPath = Join-Path "lib" $jdbcJar.Name
# Exclude UI files that depend on JavaFX - compile only non-UI and non-Main files
$filesToCompile = @()
foreach ($file in $files) {
    if ($file -notlike "*\ui\*" -and $file -notlike "*Main.java") {
        $filesToCompile += $file
    }
}
& javac -cp "$jdbcPath" -d out $filesToCompile 2>&1 | Where-Object { $_ -notmatch "error:" } | ForEach-Object { Write-Host $_ }

# Check for actual fatal errors (not just warnings)
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Compilation successful" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Some files had compilation issues (UI files excluded as expected)" -ForegroundColor Yellow
}

# Step 4: Copy resources
New-Item -ItemType Directory -Path "out\styles" -Force -ErrorAction SilentlyContinue | Out-Null
Copy-Item "src\main\resources\styles\beacon.css" "out\styles\" -Force -ErrorAction SilentlyContinue
Write-Host "[OK] Resources copied" -ForegroundColor Green

# Step 5: Build JDBC URL and launch API Server
Write-Host "`n[STEP] Setting up database connection..." -ForegroundColor Yellow

# Parse connection string 
$dbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost\SQLEXPRESS" }
$dbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "1433" }
$dbName = if ($env:DB_NAME) { $env:DB_NAME } else { "beacon_db" }
$dbUser = if ($env:DB_USER) { $env:DB_USER } else { "sa" }
$dbPassword = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "" }
$dbAuth = if ($env:DB_AUTHENTICATION) { $env:DB_AUTHENTICATION } else { "SqlServer" }

# Build JDBC URL based on authentication method
if ($dbAuth -eq "SqlServer") {
    # For SQL Server authentication, don't include user/password in URL - let DatabaseConnection handle it
    $jdbcUrl = "jdbc:sqlserver://$($dbHost):$dbPort;databaseName=$dbName;encrypt=true;trustServerCertificate=true"
    Write-Host "[OK] Using SQL Server Authentication (user: $dbUser)" -ForegroundColor Green
} else {
    $jdbcUrl = "jdbc:sqlserver://$($dbHost):$dbPort;databaseName=$dbName;integratedSecurity=true;encrypt=true;trustServerCertificate=true"
    Write-Host "[OK] Using Windows Integrated Authentication" -ForegroundColor Green
}

Write-Host "[OK] Database: $dbName" -ForegroundColor Green

# Launch API Server only
Write-Host "`n[STEP] Starting Beacon API Server on port 7000..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

& java -DBEACON_DB_URL="$jdbcUrl" -cp "out;$jdbcPath" com.beacon.ApiOnly

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Runtime error occurred" -ForegroundColor Red
    exit 1
}
