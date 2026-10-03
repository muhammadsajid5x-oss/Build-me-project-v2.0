# Peer Review Checklist

Use this checklist during Peer Polish for a Pull Request. The reviewer must be someone other than the author. Mark an item **Not applicable** only when the area does not apply, and give a brief reason where useful.

**Pull Request:** [Link]
**Child Story:** [ID and title]
**Reviewer:** [Name]

## Requirement

- [ ] The Child Story and acceptance criteria are identified.
- [ ] The change meets the agreed user outcome and requirements.
- [ ] Scope is respected; no unrequested behavior was added.
- [ ] Any unclear requirement is raised rather than guessed.

## Code

- [ ] The change is correct and fits the existing architecture.
- [ ] Error and edge-case behavior is handled where relevant.
- [ ] No unrelated or unnecessary changes are included.

## Tests

- [ ] Tests cover the changed behavior and relevant failure cases.
- [ ] Relevant tests were run and results reviewed.
- [ ] Missing tests are explained or requested before approval.

## Security

- [ ] Input, access control, and sensitive data were reviewed where relevant.
- [ ] No secrets or internal details are exposed.
- [ ] Security concerns are resolved or explicitly tracked.
- [ ] Not applicable: [Reason, if applicable]

## Performance

- [ ] Performance impact was considered where relevant.
- [ ] Material risks were measured or have a validation plan.
- [ ] Not applicable: [Reason, if applicable]

## Analytics

- [ ] Required analytics events and properties are covered.
- [ ] Analytics do not include unapproved sensitive data.
- [ ] Not applicable: [Reason, if applicable]

## Documentation

- [ ] Relevant setup, API, architecture, user, or operational documentation is updated.
- [ ] Not applicable: [Reason, if applicable]

## Clean Code

- [ ] Is the code easy for another engineer to read and understand?
- [ ] Are names clear and meaningful?
- [ ] Is any logic duplicated unnecessarily?
- [ ] Is any function too large or responsible for too much?
- [ ] Is any component doing too much or combining unrelated responsibilities?
- [ ] Is the solution more complicated than needed, including unnecessary abstractions?
- [ ] Does the change follow Clean Code principles: clear, focused, readable, and predictable?
- [ ] Are SOLID principles applied where they improve maintainability, without applying them mechanically?
- [ ] Does the change avoid duplication (DRY) without introducing premature abstractions?
- [ ] Is the solution kept simple (KISS) with straightforward control flow and familiar patterns?
- [ ] Are types, formatting, and project conventions followed?

If a check fails, record the concern or explain why it is acceptable before approval.

## Review Outcome

- [ ] Approve
- [ ] Request changes
- [ ] Comment only; approval is still pending

**Blocking findings or follow-up:** [None, or list items]

Approval confirms technical peer review only. It does not replace Product Acceptance, required CI checks, or release approval.
