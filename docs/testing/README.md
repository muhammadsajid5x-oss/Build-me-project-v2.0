@'

# Technology Testing

## Purpose

This document explains how testing works in the Build Me Technology system.

Testing provides confidence that applications, services, packages, database changes, and integrations work correctly before release.

## Testing Strategy

Build Me follows a layered testing approach:

```text
Unit Tests
    ↓
Component Tests
    ↓
Integration / API Tests
    ↓
End-to-End Tests
    ↓
Performance Tests
    ↓
Security Validation
    ↓
CI Quality Gates
```

## Local Integration Tests

Integration tests persist data, so run them only against a disposable test
database. Set `TEST_DATABASE_URL` to that database's PostgreSQL connection
string; local test runs will not reuse an existing development API.

In PowerShell:

```powershell
$env:TEST_DATABASE_URL = "<disposable PostgreSQL connection string>"
$env:DATABASE_URL = $env:TEST_DATABASE_URL
$env:NODE_ENV = "test"
pnpm --dir database db:migrate
pnpm --filter @build-me/database... build
$env:DATABASE_SEED_CONFIRM = "1"
pnpm --dir database exec tsx seeds/seed-testimonials.ts
pnpm test:integration
```

In CI, `DATABASE_URL` is provided by the test job, which starts the API before
Playwright runs.
