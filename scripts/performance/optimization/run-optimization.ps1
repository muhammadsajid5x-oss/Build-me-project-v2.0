$ErrorActionPreference = "Stop"

Write-Host "Starting performance optimization checks..."

pnpm exec playwright test tests/performance/homepage.performance.spec.ts

if ($LASTEXITCODE -ne 0) {
    Write-Host "Performance optimization checks failed."
    exit $LASTEXITCODE
}

Write-Host "Performance optimization checks complete."