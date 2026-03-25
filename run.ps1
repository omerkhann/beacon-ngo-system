# Beacon NGO Management System - Build & Run Script
# Usage: .\run.ps1

Write-Host "Beacon NGO Management System - Compiling and Running..." -ForegroundColor Cyan

# Load local DB settings if present (db.env: KEY=VALUE lines)
$envFile = "db.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) {
            return
        }

        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim().Trim('"')
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "Loaded database config from db.env" -ForegroundColor Gray
} else {
    Write-Host "db.env not found. Using current environment variables/defaults." -ForegroundColor Gray
}

# Ensure SQL Server JDBC driver exists
$jdbcJar = Get-ChildItem -Path lib -Filter "mssql-jdbc*.jar" -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending |
    Select-Object -First 1
if (-not $jdbcJar) {
    Write-Host "Missing JDBC driver in lib/. Expected a file like mssql-jdbc-<version>.jar" -ForegroundColor Red
    Write-Host "Download and place the jar in lib/ before running." -ForegroundColor Yellow
    exit 1
}
Write-Host "Using JDBC jar: $($jdbcJar.Name)" -ForegroundColor Gray
$jdbcJarPath = Join-Path "lib" $jdbcJar.Name

$usingIntegratedAuth = ($env:BEACON_DB_URL -match "integratedSecurity=true")
if ($usingIntegratedAuth) {
    $authDll = Get-ChildItem -Path lib -Filter "mssql-jdbc_auth*.dll" -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $authDll) {
        Write-Host "Windows Authentication is enabled, but no SQL JDBC auth DLL was found in lib/." -ForegroundColor Red
        Write-Host "Copy mssql-jdbc_auth-<version>-x64.dll into lib/ and run again." -ForegroundColor Yellow
        exit 1
    }
} else {
    if ([string]::IsNullOrWhiteSpace($env:BEACON_DB_USER)) {
        $inputUser = Read-Host "Enter SQL Server username"
        [Environment]::SetEnvironmentVariable("BEACON_DB_USER", $inputUser, "Process")
    }

    if ([string]::IsNullOrWhiteSpace($env:BEACON_DB_PASSWORD)) {
        $securePassword = Read-Host "Enter SQL Server password" -AsSecureString
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        [Environment]::SetEnvironmentVariable("BEACON_DB_PASSWORD", $plainPassword, "Process")
    }
}

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
javac -cp $jdbcJarPath -d out $files

if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed. Check errors above." -ForegroundColor Red
    exit 1
}

Write-Host "Compilation successful." -ForegroundColor Green

# Run
Write-Host "Launching Beacon application..." -ForegroundColor Yellow
Write-Host "DB URL: $($env:BEACON_DB_URL)" -ForegroundColor Gray
Write-Host "DB User: $($env:BEACON_DB_USER)" -ForegroundColor Gray
if ($usingIntegratedAuth) {
    $javaArgs = @("-Djava.library.path=lib", "-cp", "out;$jdbcJarPath", "com.beacon.Main")
    & java @javaArgs
} else {
    $javaArgs = @("-cp", "out;$jdbcJarPath", "com.beacon.Main")
    & java @javaArgs
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Runtime error. Ensure SQL Server is running and Database is configured." -ForegroundColor Red
    exit 1
}
