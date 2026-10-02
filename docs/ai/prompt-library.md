# AI Prompt Library

Ready-to-use prompts for each stage of the [Technology AI Workspace](README.md). Paste the Child Story (or the relevant code, logs, or results) after the prompt. Detailed versions of some prompts live in [docs/standards](../standards/AI-Prompt-Library.md) and are linked where they exist.

## Sections

1. [Understand Requirement](#1-understand-requirement)
2. [Break Into Tasks](#2-break-into-tasks)
3. [Plan](#3-plan)
4. [Design](#4-design)
5. [Architecture](#5-architecture)
6. [API Design](#6-api-design)
7. [Database Design](#7-database-design)
8. [Component Design](#8-component-design)
9. [Generate Code](#9-generate-code)
10. [Explain Code](#10-explain-code)
11. [Debug](#11-debug)
12. [Generate Tests](#12-generate-tests)
13. [Review Tests](#13-review-tests)
14. [Review Code](#14-review-code)
15. [Security Review](#15-security-review)
16. [Performance Review](#16-performance-review)
17. [Validate Implementation](#17-validate-implementation)
18. [Prepare Deployment](#18-prepare-deployment)
19. [Analyse Production](#19-analyse-production)
20. [Improve](#20-improve)

## Rules For All Prompts

- Reuse the existing Build Me foundations before proposing anything new.
- Do not guess missing requirements; write **Needs Confirmation** and say what must be confirmed.
- Never include secrets, personal data, or production credentials.
- Report only what was verified; say what was not run.
- Follow the [AI safety rules](../security/ai-safety-rules.md).
- Improve a prompt when it gives poor results and save the better version here.

## 1. Understand Requirement

Prompt: [Child Story requirement understanding prompt](child-story-requirement-understanding-prompt.md). Detail: [understand-requirement](../standards/understand-requirement.md).

> Read this Child Story. Restate the requirement, users, and outcome in plain language. List assumptions, constraints, ambiguities, missing information, and acceptance criteria. Mark anything not stated as Needs Confirmation. Do not design or build yet.

## 2. Break Into Tasks

Detail: [break-down-requirement](../standards/break-down-requirement.md).

> Break this approved Child Story into small, ordered, testable technical tasks. For each task give its purpose, dependencies, edge cases, and how it will be tested. Do not write code.

## 3. Plan

Detail: [implementation-approach](../standards/implementation-approach.md).

> Create an implementation plan for this Child Story using the existing Build Me foundations. Compare options where there is a real choice, state trade-offs and risks, and give a delivery sequence. Do not write code.

## 4. Design

Detail: [Design prompt](design.md).

> Design this Child Story using the existing Build Me architecture. Show me the user flow, components, API contract, database needs, analytics events, security controls, performance concerns, testing approach and deployment needs. Reuse the existing Card, Modal, SPA, layout, API and database foundations wherever possible.

## 5. Architecture

> Review how this Child Story fits the Build Me architecture (web and dashboard apps, API service, database, analytics, shared packages). Identify which existing parts are reused, what changes, and anything genuinely new with the reason. Record each decision with alternatives considered, and mark open decisions as Needs Confirmation. See [Architecture](../architecture/README.md).

## 6. API Design

> Read this Child Story and identify whether an API is required. If yes, propose the API contract only. Include endpoint, method, request, validation, response, status codes, errors, authentication, authorisation and example request/response. Do not write the API implementation yet.

Follow the [API standards](../api/standards.md) and [contract template](../api/contract-template.md).

## 7. Database Design

> Identify the data this Child Story needs. Propose table or column changes for the existing Drizzle schema, with types, constraints, indexes, relationships, and a migration approach that is reversible. Cover data protection, retention, and the effect on existing data. Do not write the migration yet. See [Database documentation](../database/README.md).

## 8. Component Design

> Design the UI components for this Child Story. List which existing components (Card, Modal, layout, shared UI) are reused, what new components are needed and why, their props, states (loading, empty, error, success), accessibility needs, and how each will be tested. Do not write the code yet.

## 9. Generate Code

Detail: [generate-code](../standards/generate-code.md).

> Implement the approved plan for this Child Story with the smallest change that meets it. Follow the project coding standards, reuse existing code, and include tests. Do not add features beyond the plan. List the files changed and anything you could not verify.

## 10. Explain Code

Detail: [explain-code](../standards/explain-code.md).

> Explain this code: its purpose, how data flows through it, key decisions, dependencies, and risks. Use plain language and point to specific lines. Say where you are unsure rather than guessing.

## 11. Debug

Detail: [debug-code](../standards/debug-code.md) and the [AI debugging workflow](../operations/ai-debugging-workflow.md).

> Help me debug this problem. Here are the error, logs, expected and actual behaviour, and recent changes. Give the most likely causes ranked by evidence, how to confirm each, and the smallest fix. Do not change code until the cause is confirmed.

## 12. Generate Tests

Detail: [generate-tests](../standards/generate-tests.md) and the [AI testing workflow](../testing/ai-testing-workflow.md).

> Create a test plan for this Child Story. Include unit, component, integration, API, E2E, performance, security and analytics tests where applicable. Explain what each test proves.

## 13. Review Tests

Detail: [review-tests](../standards/review-tests.md).

> Review these tests against the Child Story acceptance criteria. Identify missing cases, weak assertions, tests that cannot fail, flaky or order-dependent tests, and over-mocking. Say what each gap risks and propose specific additions.

## 14. Review Code

Detail: [review-code](../standards/review-code.md) and [peer review checklist](../standards/peer-review-checklist.md).

> Review this change against the plan, coding standards, and tests. Check correctness, readability, error handling, reuse, and unintended side effects. Group findings by severity and give the evidence and a suggested fix for each.

## 15. Security Review

Standards: [security-standards](../standards/security-standards.md).

> Security-review this change. Cover authentication, authorisation, input validation, data protection, secrets, API security (errors, CORS, headers, rate limiting), dependencies, and abuse risks such as enumeration and replay. For each finding give severity, evidence, and a fix. State what you could not verify.

## 16. Performance Review

See [Performance observation](../operations/performance-observation.md).

> Review this change for performance. Check page load and rendering, bundle size, API response time, database queries and indexes, and resource use. Identify likely bottlenecks with evidence, how to measure each, and the smallest fix. Do not optimise without a measurement.

## 17. Validate Implementation

Detail: [validate-implementation](../standards/validate-implementation.md).

> Validate this implementation against the Child Story and its acceptance criteria. For each criterion say whether it is met, with evidence (test, behaviour, or code). List gaps, deviations from the design, and checks that were not run.

## 18. Prepare Deployment

Detail: [prepare-deployment](../standards/prepare-deployment.md) and the [Rollback guide](../deployment/rollback-guide.md).

> Prepare this Child Story for deployment. Check build, tests, environment variables, database migrations, analytics, security, performance, rollback and monitoring. Give me a simple deployment checklist.

## 19. Analyse Production

See [Feature analytics review](../analytics/feature-analytics-review.md) and the [Technology KPI review](../operations/technology-kpi-review.md).

> Analyse how this released Child Story is performing. Using these analytics, errors, performance, and KPI results, compare actual use and behaviour with the expected outcome. Highlight problems, unexpected patterns, and gaps in the data. Do not state conclusions the data does not support.

## 20. Improve

Detail: [improve-code](../standards/improve-code.md). Process: [Improvement process](../planning/improvement-process.md).

> From these findings, identify improvements as Problem, Cause, Idea, Small Change, Measure. Suggest one small change per problem with a metric, baseline, and re-measure date. Add backlog items to the [Improvement backlog](../planning/improvement-backlog.md), debt to the [Technical debt register](../planning/technical-debt-register.md), and lessons to the [Lessons log](../planning/lessons-log.md).
