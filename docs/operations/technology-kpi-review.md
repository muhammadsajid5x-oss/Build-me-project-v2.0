# Technology KPI Review

## Purpose

Review the health of the delivered system across seven areas and decide what to improve. Run it before starting work on a new feature to confirm the foundation is healthy, and again after delivery to see what changed.

## Running the Review

```text
pnpm review:kpis
```

Start the API (`http://localhost:3000`), Web (`http://localhost:5173`), and Dashboard (`http://localhost:5174`) first; otherwise their availability and the checks that depend on them are reported as not run. The script writes `test-results/delivery-kpi-review.json`. Set `KPI_REQUIRE_SERVICES=1` to fail when a service is unreachable, and `KPI_RUN_DATABASE=1` to run the database timing probe against an approved non-production database.

## KPIs

| KPI          | Question                                          | Measured by the script                                                   | Needs other evidence                                                                                                                             |
| ------------ | ------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Availability | Are the API, Web app, and Dashboard reachable?    | HTTP status and response time for each local service                     | Deployed-environment uptime from Vercel and production monitoring                                                                                |
| Reliability  | Do the automated tests pass consistently?         | `pnpm test` pass/fail                                                    | Flaky-test history and production error rates from [Error Monitoring](error-monitoring-approach.md)                                              |
| Performance  | Are pages, the API, and the database fast enough? | Homepage Playwright test, Web/API response time, optional database probe | k6 profiles and production latency; see [Performance Observation](performance-observation.md)                                                    |
| Security     | Are dependencies and the API protected?           | `pnpm audit --prod` and the API security tests                           | ZAP scan results from CI and security findings from GitHub                                                                                       |
| Delivery     | How quickly and smoothly do changes reach users?  | Presence of the CI, security, and deployment workflows                   | Cycle time, lead time, throughput, and deployment outcomes; see [Delivery Metrics](delivery-metrics.md)                                          |
| Defects      | What broke after release?                         | Failed local checks                                                      | Post-release defects and incidents from the issue tracker                                                                                        |
| Recovery     | Can the system be restored after a failure?       | Presence of the rollback and database recovery guides                    | A recorded restore drill; see the [Rollback Guide](../deployment/rollback-guide.md) and [Database Recovery Guide](../database/recovery-guide.md) |

## Review Record

Complete one record per review and keep it with the release or planning record.

```text
Date / commit / environment:
Report file or link:

Availability:
Reliability:
Performance:
Security:
Delivery:
Defects:
Recovery:

Checks not run and why:
Evidence gaps:
Improvement actions, owner, review date:
```

## Targets and Gaps

- No KPI targets, SLOs, or thresholds are defined. **Needs Confirmation:** the Technology Owner should agree targets for each KPI before they are used as gates.
- The script does not query GitHub, Vercel, or an issue tracker, and it does not run a restore drill. Record that evidence manually until it is integrated.
- A passing local run shows the foundation works on the developer machine; it is not evidence of production health.
