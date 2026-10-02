# Lessons Log

Record lessons after foundation setup and after each Child Story. Turn lessons that need action into items in the [Improvement Backlog](improvement-backlog.md) and follow the [Improvement Process](improvement-process.md). Record unresolved debt in the [Technical Debt Register](technical-debt-register.md).

## Entry Template

Copy one entry per Foundation or Child Story. Add new entries at the top of the log.

```text
### <Foundation | Child Story ID and title> (YYYY-MM-DD)

Evidence (KPI report, PR, incident, link):

What worked?
What failed?
What did we learn?
What should we change?   -> backlog item ID
What should we reuse?
```

## Log

### Foundation Setup (2026-10-03)

Evidence: `pnpm review:kpis` report in `test-results/delivery-kpi-review.json`, the [Technology KPI Review](../operations/technology-kpi-review.md), and the CI and security workflows.

**What worked?**

- A single command (`pnpm review:kpis`) gives a repeatable health check across availability, reliability, performance, security, delivery, defects, and recovery.
- Turbo and pnpm workspaces keep the web app, dashboard, API, database, and shared packages in one repository with common scripts.
- Security checks (`pnpm audit --prod`, API security tests) found a real dependency issue early, and it was fixed with an override.
- Written guides for rollback, recovery, error monitoring, and delivery metrics make the expected behaviour explicit.

**What failed?**

- Parallel `turbo build` ran out of memory; the build only succeeded when run serially (TD-002).
- Stale pnpm links broke installs until the workspace was relinked.
- NodeNext module resolution required explicit file extensions and caused type errors until they were added.
- Terminal output was often not captured for synchronous commands, which slowed verification.
- Cypress and Storybook test-runner results were never captured (TD-003).

**What did we learn?**

- Check that a result was actually observed before reporting it as passing.
- Local checks that need running services (API security tests, website performance) are skipped when the services are down, so a green run can hide gaps; read the "not-run" entries.
- Environment protection for production and Vercel environments cannot be configured from the repository and needs an owner outside it (TD-006).
- No targets exist, so results cannot yet be judged good or bad (TD-004).

**What should we change?**

- Define KPI targets and SLOs (IMP-001).
- Limit build concurrency and confirm builds in CI (TD-002).
- Record Cypress and Storybook results in CI reporting (IMP-007).
- Run and record a restore drill (IMP-003).

**What should we reuse?**

- The `review:kpis` script and report format for each Child Story review.
- The Improvement Process and the entry templates in the backlog and this log.
- Windows-safe command invocation: run pnpm through the pnpm script that started the process rather than through `PATH`.
- The CI workflow set (`ci`, `security`, `performance`, `analytics`, `release`, and the `cd-*` workflows) as the baseline for new apps and services.
