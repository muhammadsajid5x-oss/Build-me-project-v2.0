# Delivery Metrics

## Purpose

Review delivery outcomes after changes reach users. Use these measures to find bottlenecks and improve the delivery system, not to rank individuals or reward raw output.

## Metrics

| Metric                 | Definition                                                                                                                                                                                                  | Evidence source                                                                         | Review                                                                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Cycle time             | Time from work starting to the change being merged. Prefer the linked work item's start and completion timestamps; if work-item start is unavailable, record the proxy used, such as first commit to merge. | Issue/project-board history and GitHub pull request timestamps                          | Review median and range by period; note the chosen start event consistently.                                                                   |
| Lead time              | Time from the first commit in a change to its successful production deployment.                                                                                                                             | Git commit history, release/PR association, and Vercel production deployment timestamps | Review median and range for changes that reached production.                                                                                   |
| Throughput             | Count of changes successfully delivered to production during the period. Also record production deployment count separately when one deployment contains multiple changes.                                  | Merged pull requests/releases and successful Vercel production deployments              | Report as a count per week or month; do not treat more changes as inherently better.                                                           |
| Deployment performance | Deployment duration and outcome (success/failure); record recovery time when a deployment causes an incident.                                                                                               | GitHub Actions deployment runs, Vercel deployment records, and incident timeline        | Review failures, duration trends, and recovery events by environment. The preview workflow's API recovery measurement is not a production SLO. |
| Defects                | Post-deployment defects attributable to a released change, including severity, affected environment, rollback/mitigation, and time to resolution.                                                           | Issues, incident records, support reports, and deployment history                       | Review counts and severity with the related release; record attribution as unknown when it cannot be established.                              |
| Test results           | Pass/fail and duration for required CI suites; record skipped, flaky, or non-applicable checks explicitly.                                                                                                  | GitHub Actions CI and security workflow results, plus test reports/artifacts            | Review failures and recurring flaky checks before promotion and during delivery retrospectives.                                                |

## Collection Procedure

For each reporting period:

1. Select the period and environments being reviewed; separate preview/staging results from production outcomes.
2. Gather merge/commit timestamps, successful deployment timestamps, workflow outcomes, test results, and linked defects/incidents from GitHub and Vercel.
3. Calculate cycle and lead time using the definitions above. Record any timestamp proxy or missing evidence rather than silently substituting another definition.
4. Record deployment failures, defects, and recovery events against the associated commit/release where possible.
5. Summarize trends, notable causes, and improvement actions. Assign an owner and review date to each action.

## Reporting Record

```text
Period:
Environment(s):
Sources / links:
Changes delivered:
Cycle time (median/range and start-event definition):
Lead time (median/range):
Throughput (changes and deployments):
Deployment outcomes and duration:
Recovery events and duration:
Post-deployment defects by severity:
Test suite results / skipped or flaky checks:
Evidence gaps:
Actions, owner, review date:
```

## Current Capability and Gaps

- GitHub Actions provides CI, security, and deployment run outcomes; Vercel provides deployment records. These are the current evidence sources.
- The repository has performance and security test profiles, but there is no centralized delivery-metrics dashboard or automated aggregation of these records.
- The repository does not define approved cycle-time/lead-time targets, production deployment SLOs, defect thresholds, or an RPO/RTO. Agree those with the responsible owners before using them as targets or gates.
- Database response and service-error observation are described in the [Performance Observation](performance-observation.md) and [Error Monitoring Approach](error-monitoring-approach.md).

Until automated aggregation is added, maintain the reporting record in the relevant release or review record and link its source evidence.

## Foundation Review Command

Run the local foundation scorecard with:

```text
pnpm review:kpis
```

The script probes the API, Web, and Dashboard URLs; runs the workspace tests and production dependency audit; and runs the focused security and website performance tests when their local services are available. It records the Git branch/commit, deployment workflow configuration, local check failures, and presence of rollback/recovery guides. The latest JSON report is written to `test-results/delivery-kpi-review.json`.

Database timing is opt-in because it connects to the `DATABASE_URL` configured by the database probe. Only enable it for an approved non-production database:

```powershell
$env:KPI_RUN_DATABASE = "1"
pnpm review:kpis
```

The script does not query GitHub/Vercel run history or an issue tracker. Cycle time, production lead time, actual delivery throughput, and post-release defect attribution therefore remain external evidence to add to the reporting record. It checks that recovery guides exist but does not perform a restore drill.
