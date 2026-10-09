# Rollback Guide

Use this guide when a deployment causes a serious failure. Do not make an unreviewed production change while investigating.

```text
Something went wrong
        ↓
Stop / assess
        ↓
Choose last safe version
        ↓
Rollback
        ↓
Check system
        ↓
Check data
        ↓
Monitor
```

## 1. Stop and Assess

- Stop further deployments and promotion.
- Identify the affected environment, services, deployment, and time the issue began.
- Assess user impact, security risk, and whether data may have changed.
- Notify the Technology Owner and follow the incident process for serious production impact.

## 2. Choose the Last Safe Version

- Find the most recent deployment known to be healthy for the affected service.
- Confirm its commit and matching API/Dashboard versions.
- Review database migrations since that deployment and verify the old code is compatible with the current schema.

## 3. Roll Back

- Use the approved Vercel rollback or promotion procedure to restore the last safe deployment.
- Roll back related services together when they depend on the same API contract.
- If the database change is not backward-compatible, do not blindly restore old application code. Prefer an approved forward fix or the documented database recovery procedure.

## 4. Check the System

- Confirm the API health endpoint returns HTTP 200.
- Confirm the Web and Dashboard load in the affected environment.
- Check authentication and the critical user journeys affected by the incident.
- Review application and deployment logs for recurring errors.

## 5. Check the Data

- Verify recent writes, migration state, and important records for consistency.
- Preserve a current backup/snapshot before any restore or corrective data operation.
- Restore data only through the approved recovery procedure and with the responsible owner’s authorization; application rollback does not undo database migrations.

## 6. Monitor

- Watch logs, errors, health, and performance after rollback.
- Keep further promotion paused until the system is stable and the cause is understood.
- Record the incident, chosen version, actions, data checks, and follow-up fix.
