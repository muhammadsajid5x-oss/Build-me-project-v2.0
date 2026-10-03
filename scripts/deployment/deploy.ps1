$ErrorActionPreference = "Stop"

Write-Host "Starting deployment preparation..."

Write-Host "Installing dependencies..."
pnpm install --frozen-lockfile

Write-Host "Running tests..."
pnpm test

Write-Host "Building project..."
pnpm build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment preparation failed."
    exit $LASTEXITCODE
}

Write-Host "Deployment preparation complete."