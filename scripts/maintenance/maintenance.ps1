$ErrorActionPreference = "Stop"

Write-Host "Starting maintenance checks..."

Write-Host "Checking dependency installation..."
pnpm install --frozen-lockfile

Write-Host "Checking project build..."
pnpm build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Maintenance checks failed."
    exit $LASTEXITCODE
}

Write-Host "Maintenance checks complete."