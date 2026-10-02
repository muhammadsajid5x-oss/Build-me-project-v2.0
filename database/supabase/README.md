# Supabase

Supabase is part of the Build Me database architecture.

## Architecture

Drizzle
↓
Schema
↓
Migration
↓
PostgreSQL
↓
Supabase

## Responsibilities

### Drizzle

Defines the application database schema and manages database migrations.

### PostgreSQL

Provides the underlying relational database.

### Supabase

Provides database platform capabilities around PostgreSQL, including:

- Authentication
- Storage
- API access
- Row Level Security
- Edge Functions
- Local development tooling

## Local CLI

The Supabase CLI project is rooted at `database/`; its config is `database/supabase/config.toml`. From the repository root, inspect local service status with:

```text
pnpm exec supabase status --workdir database
```

Drizzle remains the source of truth for schema and migrations in `database/schema/` and `database/migrations/`. Supabase CLI service configuration does not replace the Drizzle migration workflow.

Supabase CLI SQL seeding is disabled because development/test data is managed by the guarded TypeScript seed command in `database/seeds/`, not by a `supabase/seed.sql` file.

## Directory Structure

```text
supabase/
├── config.toml
├── policies/
└── functions/
```

Policies and functions are added only when an approved access-control rule or Supabase-specific backend requirement needs them. See the directory READMEs for the current status and conventions.
