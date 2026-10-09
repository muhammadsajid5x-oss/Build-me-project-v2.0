$ErrorActionPreference = "Stop"
Write-Host "Starting database seed..."
pnpm --filter @build-me/database db:seed
Write-Host "Database seed complete."
