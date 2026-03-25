# Beacon NGO Management System - Clean Build Artifacts

Write-Host "Cleaning build artifacts..." -ForegroundColor Cyan

if (Test-Path out) {
    Remove-Item -Recurse -Force out
    Write-Host "Removed 'out' directory." -ForegroundColor Green
} else {
    Write-Host "'out' directory not found." -ForegroundColor Gray
}

Write-Host "Clean complete." -ForegroundColor Green
