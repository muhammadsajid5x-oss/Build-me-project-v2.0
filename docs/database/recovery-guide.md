# Database Recovery Guide

## Purpose

Restore database service and data safely after loss, corruption, or an unsuccessful migration. Coordinate database recovery with the application [Rollback Guide](../deployment/rollback-guide.md); restoring application code does not restore database state.

## Current State and Required Confirmation

The repository uses Supabase PostgreSQL and Drizzle migrations in `database/migrations/`. No backup schedule, retention period, point-in-time recovery setting, recovery-point objective (RPO), or recovery-time objective (RTO) is configured or documented here.

Before production use, the Supabase project owner must confirm and record:

- Which backup and point-in-time recovery features are enabled for the project and plan.
- Backup frequency, retention, and the latest successful backup time.
- Whether storage object data and required project configuration are covered separately from PostgreSQL backups.
- Approved RPO, RTO, and recovery approver.

Do not assume that a backup exists or that a restore includes data outside the PostgreSQL database until verified in the Supabase project settings and documentation.

## What Must Be Backed Up

At minimum, maintain recoverable backups of the PostgreSQL database, including application schemas, tables, migration metadata, and required database objects. Separately identify and protect any required Supabase Storage objects, secrets/configuration, and external integration data; they may have separate backup and restore procedures.

Backups must be access-controlled, retained according to the approved policy, and protected from accidental deletion. Never store production credentials or unencrypted production dumps in the repository.

## Recovery Procedure

1. **Stop and assess.** Pause deployments and risky writes where practical. Record the affected project/environment, incident time, symptoms, recent migrations, and user impact. Preserve the current state before attempting repair.
2. **Select a recovery point.** Choose the latest verified backup or approved point-in-time recovery target that predates the damage. Confirm it satisfies the approved RPO and identify any writes that may be lost.
3. **Restore safely.** An authorized operator restores into an isolated recovery project or database first, using the Supabase-supported restore procedure for the project. Do not overwrite production during the initial validation.
4. **Reconcile migrations.** Compare the restored schema and Drizzle migration history with the source commit. Drizzle migrations are forward-applied; this repository does not provide automatic down migrations. Do not delete migration records or rerun migrations blindly. Apply only reviewed, compatible migrations after the restore point.
5. **Validate data and behavior.** Check expected tables, key records, constraints, and representative reads/writes. Confirm the restored application version is compatible with the schema. Validate authentication, policies, and storage separately when they are in scope.
6. **Approve production recovery.** The Technology Owner reviews validation evidence and obtains the designated recovery approver's authorization before directing traffic to a restored production database.
7. **Monitor and record.** Watch database and application errors, API health, and critical user journeys. Record the backup/recovery point, migration state, data validation, data loss if any, elapsed recovery time, approvals, and follow-up actions.

If an old application version is incompatible with the restored schema, stop promotion and prepare a reviewed forward fix or compatible application release. Do not trade data integrity for a fast code rollback.

## Ownership

- **Technology Owner:** coordinates the incident, selects the recovery plan, checks application/schema compatibility, and approves technical validation.
- **Authorized Supabase project owner/operator:** performs backup access, point-in-time recovery, or database restore using approved credentials.
- **Product/data owner:** confirms business impact, acceptable data loss, and user-facing recovery where required.

Only named, authorized operators may access production backups or perform a production restore. Record the actual on-call names and approval path in the operational runbook; they are not configured in this repository.

## Recovery Testing

Test recovery on a schedule approved by the Technology Owner and after material changes to backup or migration procedures:

1. Select a recent verified backup and restore it into an isolated non-production project.
2. Verify schema and migration history, expected record counts/invariants, and required related data.
3. Run the applicable database checks and application/API smoke tests against the restored project.
4. Measure actual recovery time and estimated data loss; compare with the approved RTO/RPO.
5. Record the test date, backup point, operator, results, evidence, gaps, and remediation owner.

Never test by restoring over production. Until a successful restore drill is recorded, recovery capability is **unverified**.
