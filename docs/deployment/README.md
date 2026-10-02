# Technology Deployment

## Purpose

This document explains how Build Me Technology is built, validated, and deployed across environments.

Deployment should be predictable, repeatable, secure, and traceable.

See the [Rollback Guide](rollback-guide.md) for the recovery sequence and database-safety checks.

## GitHub Actions and Vercel

The deployment workflows promote the same code through these Vercel environments:

| GitHub event                                      | Vercel environment | Gate                                   |
| ------------------------------------------------- | ------------------ | -------------------------------------- |
| Successful CI run for a pushed `feature/*` branch | Preview            | CI Quality Gate must pass              |
| Successful CI run for a push to `development`     | Development        | CI Quality Gate must pass              |
| Successful Development deployment                 | Staging            | Build must pass                        |
| Manual dispatch from `main`                       | Production         | GitHub production-environment approval |

Preview deployments are associated with their source feature branch. Development and Staging use Vercel custom environments named `development` and `staging`; create both environments in each Vercel project (API and Dashboard) and configure their environment variables and domains. Vercel custom environments require a supported plan. Preview and Production use Vercel's built-in environments.

Create matching GitHub Actions environments named `preview`, `development`, `staging`, and `production`. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_API_PROJECT_ID`, and `VERCEL_DASHBOARD_PROJECT_ID` as environment-scoped secrets for each deployment environment. The token should have only the Vercel team/project access needed for these deployments.

In GitHub repository settings, protect the `production` environment with required reviewers and restrict its deployment branches to `main`. Protect `main` with the repository's required review and CI status checks. The production workflow can only be dispatched from `main`, but the reviewer rule is configured in GitHub settings and cannot be enforced by this repository's workflow YAML alone.

## Deployment Flow

The standard deployment lifecycle is:

```text
Code Change
    ↓
Git Branch
    ↓
Pull Request
    ↓
Code Review
    ↓
CI Quality Gates
    ↓
Build
    ↓
Environment Deployment
    ↓
Smoke / Health Validation
    ↓
Monitoring
```
