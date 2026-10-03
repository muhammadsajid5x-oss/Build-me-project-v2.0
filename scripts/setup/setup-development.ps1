$ErrorActionPreference = "Stop"

Write-Host "Starting Build Me development setup..."

Write-Host "Checking Node.js..."
node --version

Write-Host "Checking pnpm..."
pnpm --version

Write-Host "Installing dependencies..."
pnpm install

Write-Host "Development environment setup complete."