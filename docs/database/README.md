# Technology Database

## Purpose

This document explains how the Build Me database is structured, managed, migrated, seeded, and used by Technology.

## Database Location

Database-related code is maintained under:

`database/`

The database layer is separated from applications and services so that database responsibilities remain centralized and maintainable.

## Database Responsibilities

The database layer manages:

- Database schema
- Tables and relationships
- Migrations
- Seed data
- Database configuration
- Database access logic

## Database Schema Process

Use this process for database changes:

```text
Requirement
	↓
Data Needed?
	↓
Data Model
	↓
Drizzle Schema
	↓
Migration
	↓
Test
```

1. **Requirement:** Identify the approved behavior and the information it requires. Do not add data needs that are not supported by the requirement.
2. **Data Needed?:** Decide whether the behavior requires data to be persisted or queried. If not, stop; no data model, schema, or migration is needed.
3. **Data Model:** Define the required entities, fields, relationships, constraints, and lifecycle based on the requirement.
4. **Drizzle Schema:** Implement the approved data model in `database/schema/` using the project's Drizzle conventions.
5. **Migration:** Generate and review a migration for the schema change. Do not modify an applied migration to represent a new change.
6. **Test:** Verify the resulting behavior, including relevant constraints and migration effects, with appropriate automated tests.

## Database Structure

The general structure is:

```text
database/
├── schema/
├── migrations/
├── seeds/
└── ...
```

## Development/Test Seeds

Seed fixtures are stored in `database/seeds/data/` and run with:

```text
pnpm --filter @build-me/database db:seed
```

The seed is transactional and idempotent. It uses fake `.local` users, stable fixture IDs, and development projects only. It refuses to run unless `NODE_ENV` is `development` or `test` and `DATABASE_SEED_CONFIRM=1`.

For a local development database in PowerShell:

```powershell
$env:NODE_ENV = "development"
$env:DATABASE_SEED_CONFIRM = "1"
pnpm --filter @build-me/database db:seed
```

Local database hosts are allowed. For a verified, isolated remote development/test database only, also set `DATABASE_SEED_ALLOW_REMOTE=1`. Never use seed flags for production.
