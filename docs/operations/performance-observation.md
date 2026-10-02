# Performance Observation

## Purpose

Observe deployed and pre-deployment behavior for user-visible speed, API response time, database response time, and service errors. Use the same environment, commit, request path, and observation window when comparing results.

## Signals and Current Evidence

| Signal                         | Current observation method                                                                                                                                | What it measures                                                                                     | Current limitation                                                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Website speed                  | `pnpm test:performance` runs `tests/performance/homepage.performance.spec.ts`                                                                             | Local homepage navigation to `DOMContentLoaded`; current test limit is 5 seconds                     | This is a CI/browser check, not real-user monitoring or a deployed-site dashboard                                                    |
| API response time and failures | `Performance Automation` runs `tests/performance/validation/api-rate-limit-validation.k6.js`; diagnostic and load profiles are under `tests/performance/` | Health endpoint status, request duration, and failed-request rate where a profile defines thresholds | CI currently runs the rate-limit validation profile; the diagnostics, regression, and load profiles are not wired into that workflow |
| Database response              | Run `database/performance.ts` against the configured database                                                                                             | Twenty `SELECT 1` round trips; reports average and p95 when `DEBUG_PERFORMANCE=1`                    | Manual probe only; it does not represent application query latency or production database health                                     |
| Service errors                 | Inspect structured JSON logs and group by the `service` field (`api`, `services`, `database`, or `web`)                                                   | Error counts and context emitted by application error handlers and service clients                   | Logs are emitted to stdout/stderr; centralized aggregation, alert routing, and service-level dashboards are not configured here      |

The API k6 profiles define different thresholds for different workloads. For example, diagnostics uses p95 below 500 ms, p99 below 1,000 ms, and failed requests below 1%; load uses p95 below 1,500 ms and p99 below 2,000 ms; the rate-limit regression profile uses p95 below 100 ms. Treat these as test-profile thresholds, not approved production SLOs.

## Observation Procedure

1. Record environment, deployment URL, commit, observation time, and test/profile used.
2. Check the homepage speed result and note whether it is a local CI run or a deployed observation.
3. Run the relevant API k6 profile against the target using `API_BASE_URL`; review p95/p99 duration, failed-request rate, and status checks.
4. When database access is available, run the manual database probe with `DATABASE_URL` configured and `DEBUG_PERFORMANCE=1`.
5. Review structured application logs for service errors during the same window. Group repeated failures by service, error code, route/operation, and time; do not record secrets or personal data.
6. Compare results with the previous observation and the relevant test threshold. Investigate regressions, repeated failures, or unexpected error-rate changes before promoting the deployment.
7. Record findings and follow the [Error Monitoring Approach](error-monitoring-approach.md) for triage, correction, verification, and recurrence review.

## Database Probe

PowerShell example from the repository root:

```powershell
$env:DEBUG_PERFORMANCE = "1"
pnpm --dir database exec tsx performance.ts
```

The probe reads `DATABASE_URL` from the environment or root `.env`. Use only an approved development, test, or staging database for routine observation.

## Evidence Record

For each observation, retain:

- Environment, deployment URL, commit, and observation window
- Website timing and test result
- API profile, request count, p95/p99 duration, failure rate, and status results
- Database probe average/p95 and database environment, when run
- Service error counts, codes, and affected operations, with sensitive values removed
- Investigation, owner, follow-up action, and post-fix verification

No production alerting or continuous real-user performance monitoring is configured by this foundation. Add those integrations and agree production SLOs before treating these checks as continuous production monitoring.
