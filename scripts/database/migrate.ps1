$ErrorActionPreference = "Stop"
Write-Host "Starting database migration..."
pnpm --filter @build-me/database db:migrate
Write-Host "Database migration complete."
