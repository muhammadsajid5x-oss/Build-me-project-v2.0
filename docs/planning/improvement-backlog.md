# Improvement Backlog

## Purpose

Turn learning (reviews, incidents, KPI results, feedback) into tracked improvements. Add an item whenever a review finds something to change, and review the backlog when planning each cycle.

## Categories

| Category       | Use for                                                         |
| -------------- | --------------------------------------------------------------- |
| Customer       | Feedback, support requests, and unmet customer needs            |
| Product        | Feature gaps, usability issues, and product ideas               |
| Technology     | Architecture, tooling, infrastructure, and platform changes     |
| Process        | Planning, review, delivery, and team workflow changes           |
| Security       | Vulnerabilities, hardening, access control, and compliance gaps |
| Performance    | Slow pages, endpoints, queries, and capacity limits             |
| Automation     | Manual steps that scripts, CI, or tooling could replace         |
| Standards      | Missing, unclear, or unenforced conventions and documentation   |
| Technical Debt | Shortcuts, outdated dependencies, and code needing rework       |

## Item Template

```text
ID:
Title:
Category:
Source (review, incident, KPI report, feedback, link):
Problem / evidence:
Proposed improvement:
Impact (High / Medium / Low):
Effort (High / Medium / Low):
Status (Proposed / Accepted / In progress / Done / Rejected):
Owner:
Review date:
```

## Prioritisation

Rank accepted items by impact against effort. Security issues and items that block delivery are reviewed first. Record the reason when an item is rejected or deferred.

## Backlog

Items below come from gaps already recorded in this repository. Owners, impact, and effort are **Needs Confirmation**.

### Technology

| ID      | Item                                                                       | Source                                                                  | Status   |
| ------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------- |
| IMP-001 | Define KPI targets and SLOs for availability, reliability, and performance | [Technology KPI Review](../operations/technology-kpi-review.md)         | Proposed |
| IMP-002 | Record production error-monitoring evidence                                | [Error Monitoring Approach](../operations/error-monitoring-approach.md) | Proposed |
| IMP-003 | Run and record a non-production restore drill                              | [Recovery Guide](../database/recovery-guide.md)                         | Proposed |

### Process

| ID      | Item                                                                            | Source       | Status   |
| ------- | ------------------------------------------------------------------------------- | ------------ | -------- |
| IMP-004 | Configure required reviewers and secrets on the GitHub `production` environment | CD workflows | Proposed |
| IMP-005 | Create Vercel `development` and `staging` environments                          | CD workflows | Proposed |

### Automation

| ID      | Item                                                                    | Source                                                          | Status   |
| ------- | ----------------------------------------------------------------------- | --------------------------------------------------------------- | -------- |
| IMP-006 | Retrieve GitHub Actions and Vercel run history in the KPI review script | [Technology KPI Review](../operations/technology-kpi-review.md) | Proposed |
| IMP-007 | Capture Cypress and Storybook test-runner results in CI reporting       | Test tooling                                                    | Proposed |

### Customer, Product, Security, Performance, Standards, Technical Debt

No items recorded yet. Add them from reviews, feedback, and KPI reports.
