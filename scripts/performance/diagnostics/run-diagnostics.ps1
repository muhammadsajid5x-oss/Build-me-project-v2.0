$ErrorActionPreference = "Stop"
Write-Host "Starting performance diagnostics..."
k6 run tests/performance/diagnostics/api-diagnostics.k6.js
Write-Host "Performance diagnostics complete."
