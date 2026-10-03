# Project Standard: AI Code Review Process

## Purpose

AI may be used as an additional review layer after code has been written. Its purpose is to help identify likely defects, risks, quality issues, and missing validation before the work is considered for merge.

This process is intended to improve code quality and reduce avoidable defects, but it does not replace human judgment or engineering accountability.

## Role

The AI reviewer acts as a supplementary technical reviewer responsible for evaluating implementation quality against the project standards, expected behavior, and common engineering risks.

The AI reviewer must:

- identify likely bugs, weaknesses, and review concerns
- assess risk across correctness, security, maintainability, accessibility, performance, and testing
- flag missing validation and missing edge-case coverage
- provide findings in a structured and evidence-based format

The AI reviewer does not decide whether a change is accepted or rejected. That decision remains with the Technology Owner and the human reviewers responsible for the change.

## Goal

The goal of AI-assisted review is to support safer, higher-quality code delivery by catching issues early and prompting additional validation before merge.

AI review should help teams to:

- detect likely logic flaws
- identify security risks
- improve maintainability and clarity
- catch missing tests or validation gaps
- reduce obvious regressions before human review or CI

AI review does not replace:

- human review
- requirement validation
- architecture decisions
- test execution
- CI enforcement
- final engineering judgment

## Scope

AI review should be limited to the code relevant to the requested change, including the modified files and any directly related implementation.

The reviewer must:

- focus on the current change and its immediate impact
- consider relevant surrounding code only when needed for accurate assessment
- avoid reviewing unrelated areas of the codebase
- base findings on the actual implementation and observed code paths
- distinguish between supported conclusions and uncertain speculation

The review should align with the project architecture, coding standards, and current implementation context.

## Standard Review Flow

Code
↓
AI Review
↓
Human Review
↓
Fix
↓
Test
↓
CI

This process must not skip human review.

## AI Review Checklist

After code is written, the approved AI tool should review the implementation for the following categories.

### 1. Bugs and Logic Issues

Check for:

- incorrect logic
- incorrect conditions
- incorrect state handling
- boundary conditions
- race conditions where applicable
- unexpected behavior
- potential runtime failures

### 2. Security Problems

Check for:

- unsafe input handling
- authentication issues
- authorization issues
- injection risks
- unsafe data exposure
- insecure configuration
- secret or credential exposure
- unsafe dependency or usage patterns

Never provide passwords, API keys, tokens, or private credentials to AI.

### 3. Poor Naming

Check for:

- unclear variable names
- unclear function names
- misleading names
- inconsistent naming
- names that do not communicate intent

### 4. Duplicate Code

Check for:

- repeated logic
- repeated validation
- copy-and-paste implementation
- opportunities for appropriate reuse

Do not introduce abstractions solely to remove small or harmless duplication.

### 5. Complex Code

Check for:

- excessive nesting
- difficult-to-follow logic
- large functions
- unnecessary abstractions
- difficult control flow
- code that could be simplified without reducing clarity

### 6. Missing Error Handling

Check for:

- unhandled errors
- missing validation
- missing failure states
- missing user-facing error handling where applicable
- unsafe assumptions about external systems
- missing logging where appropriate

### 7. Missing Tests

Check for:

- missing unit tests
- missing integration tests
- missing E2E tests where applicable
- missing negative cases
- missing edge cases
- missing regression tests

### 8. Performance Problems

Check for:

- unnecessary computation
- inefficient loops
- unnecessary network requests
- inefficient database queries
- excessive rendering
- unnecessary data processing
- potential memory issues

Performance concerns should be measured before optimization claims are made.

### 9. Accessibility Problems

For user interfaces, check for:

- missing semantic HTML
- missing accessible labels
- keyboard accessibility
- focus management
- poor heading structure
- form accessibility
- color-dependent communication
- screen-reader compatibility
- interactive elements that are difficult to operate

### 10. Type Problems

Check for:

- incorrect TypeScript types
- unsafe any usage
- missing type definitions
- incorrect null or undefined handling
- unsafe type assertions
- type mismatches
- weak type boundaries

## AI Review Output

AI findings must be organized by severity and must include the following information for each finding:

### Critical

Issues that could cause serious security, data, correctness, or reliability problems.

### High

Issues that should normally be addressed before merge.

### Medium

Issues that should be considered for improvement.

### Low

Minor quality or maintainability improvements.

### Informational

Observations that do not necessarily require a change.

For every finding, provide:

- file or code location
- problem description
- why it matters
- suggested improvement
- potential risk
- confidence level

AI findings are recommendations and must be verified against the actual implementation before any action is taken.

## Human Review

After AI review, the Technology Owner or designated reviewer must evaluate the findings.

The human reviewer decides:

- which findings are valid
- which findings are false positives
- which findings require changes
- which findings can be deferred
- which findings are intentionally accepted
- whether additional investigation is required

AI must not decide what code changes are ultimately made.

## Fix

For accepted findings:

- make the required changes
- keep the change focused
- avoid unrelated refactoring
- preserve the original requirement
- update tests where necessary

## Test

After fixes, the relevant validation must be performed:

- run the relevant tests
- verify the changed behavior
- check for regressions
- re-run relevant validation

Do not assume a fix is correct because AI suggested it.

## CI

After local validation:

- push the branch
- allow CI checks to run
- review CI results
- fix failures
- do not merge while required CI checks are failing

AI review is an additional review layer and does not replace CI.

## Review Record

For significant AI-assisted reviews, record:

- review date
- scope reviewed
- AI tool used
- review findings
- human decisions
- accepted changes
- rejected findings and reasons where useful
- test results
- CI results

Do not record secrets or sensitive credentials.

## Non-Negotiable Rules

1. AI review does not replace human review.
2. AI findings must be verified.
3. The Technology Owner decides what changes are accepted.
4. AI-generated fixes must be reviewed by a human.
5. Changes must be tested.
6. Required CI checks must pass before merge.
7. Never provide secrets to AI.

## Key Principle

> AI finds possibilities. The Technology Owner makes the engineering decision.

## Key Principle

> AI finds possibilities. The Technology Owner makes the engineering decision.
