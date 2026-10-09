$ErrorActionPreference = "Stop"

Write-Host "Starting analytics processing..."

Push-Location services/analytics

try {
    $env:PYTHONPATH = Join-Path (Get-Location) "src"

    .\.venv\Scripts\python.exe -m pytest

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Analytics processing failed."
        exit $LASTEXITCODE
    }
}
finally {
    Remove-Item Env:PYTHONPATH -ErrorAction SilentlyContinue
    Pop-Location
}

Write-Host "Analytics processing complete."