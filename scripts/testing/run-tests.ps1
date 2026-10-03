$ErrorActionPreference = "Stop"
Write-Host "Starting test suite..."
pnpm test
Write-Host "Test suite completed."
