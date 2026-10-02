# Technical Debt Register

Technical debt is recorded here, not hidden. Add an entry as soon as a shortcut, workaround, or known weakness is accepted. Resolve entries through the [Improvement Process](improvement-process.md) and the [Improvement Backlog](improvement-backlog.md).

## Fields

| Field    | Meaning                                                            |
| -------- | ------------------------------------------------------------------ |
| Problem  | What the debt is and where it lives                                |
| Impact   | What it costs now (delivery speed, quality, reliability, security) |
| Risk     | What could go wrong if it is left, and how likely                  |
| Priority | High / Medium / Low, from impact and risk                          |
| Owner    | Person or role accountable; **Needs Confirmation** until assigned  |
| Plan     | The next step to remove or contain it, and when to review          |

## Priority

- **High:** security exposure, data loss risk, or a blocker for delivery.
- **Medium:** slows the team or weakens confidence in releases.
- **Low:** cosmetic or contained; review at each planning cycle.

## Register

| ID     | Problem                                                                                                       | Impact                                                                        | Risk                                                                | Priority | Owner              | Plan                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| TD-001 | `package.json` pins `pnpm.overrides` for `qs` and `ip-address` to clear audit findings                        | Transitive versions are forced and may drift from what parent packages expect | Overrides hide the real upgrade path and can break a parent package | Medium   | Needs Confirmation | Upgrade the parent dependencies, then remove the overrides; re-run `pnpm audit --prod`                      |
| TD-002 | Parallel `turbo build` ran out of memory; the build works only when run serially                              | Slower or unreliable CI and local builds                                      | Build failures on constrained runners                               | Medium   | Needs Confirmation | Find the memory-heavy package, limit Turbo concurrency, and confirm in CI                                   |
| TD-003 | Cypress and the Storybook test-runner results were never captured                                             | Two test suites have no recorded pass/fail evidence                           | Regressions in end-to-end and component behaviour go unnoticed      | Medium   | Needs Confirmation | Run both, record results, and add them to CI reporting                                                      |
| TD-004 | No KPI targets or SLOs are defined                                                                            | KPI review cannot say whether a result is good or bad                         | Problems are noticed late                                           | Medium   | Needs Confirmation | Agree targets per [Technology KPI Review](../operations/technology-kpi-review.md)                           |
| TD-005 | No restore drill has been recorded                                                                            | Recovery steps are untested                                                   | Recovery fails or takes too long during a real incident             | High     | Needs Confirmation | Run a non-production restore from the [Recovery Guide](../database/recovery-guide.md) and record the result |
| TD-006 | GitHub `production` environment protection and Vercel `development`/`staging` environments are not configured | Deployment gates are not enforced                                             | Unreviewed changes could reach production                           | High     | Needs Confirmation | Configure reviewers, secrets, and environments in GitHub and Vercel, then verify the workflows              |
| TD-007 | KPI review script does not collect GitHub, Vercel, or issue-tracker data                                      | Delivery and defect KPIs are manual                                           | Data is missing or inconsistent between reviews                     | Low      | Needs Confirmation | Add retrieval to `scripts/operations/review-kpis.mjs`                                                       |

## Reviewing the Register

- Review the register at each planning cycle; change priority when impact or risk changes.
- When an entry is resolved, mark it **Done** with the commit or PR link rather than deleting it.
- Entries above come from gaps recorded in this repository. Owners and priorities are **Needs Confirmation** until the team agrees them.
