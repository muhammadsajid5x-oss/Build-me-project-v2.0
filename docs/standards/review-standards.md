# Review Standards

## Purpose

These standards define how Technology work is reviewed before it is merged.

The goal is to ensure that changes meet the requirement, maintain code quality, include appropriate tests, and are safe to merge.

## Review Principle

> Review before merge. Validate before approval.

## Standard Review Flow

Build
|
v
Self-check
|
v
Optional AI review
|
v
Open Pull Request
|
v
Peer Polish (human review) + automated checks
|
v
Merge after approval and required checks pass

## 1. Requirement Validation

The reviewer must confirm that the implementation satisfies the intended requirement.

Check:

- Requirement is understood.
- Expected functionality is implemented.
- Acceptance criteria are addressed.
- Out-of-scope functionality has not been unnecessarily added.
- Important user journeys work as expected.

## 2. Code Quality

Review the implementation for:

- Clear naming
- Appropriate file structure
- Small and focused functions
- Focused components
- Appropriate types
- Clear control flow
- Appropriate error handling
- Maintainability
- Clean Code
- SOLID where appropriate
- DRY without premature abstraction
- KISS and minimal unnecessary complexity

## 3. Testing

Confirm that appropriate automated tests are present.

Review:

- Unit tests where applicable
- Component tests where applicable
- Integration/API tests where applicable
- E2E tests for important user journeys where applicable
- Edge cases
- Error cases
- Regression coverage
- Test quality and reliability

Tests must be executed and relevant results must be reviewed.

## 4. Security Review

Review changes for relevant security risks.

Check:

- Authentication
- Authorization
- Input validation
- Access control
- Sensitive data handling
- Secret exposure
- Dependency risks
- API security
- Unsafe data processing

Never approve code that exposes passwords, API keys, tokens, private keys, or other secrets.

## 5. Performance Review

Consider whether the change introduces performance risks.

Check where relevant:

- Unnecessary database queries
- Expensive operations
- Unnecessary network requests
- Excessive rendering
- Large payloads
- Inefficient loops or processing
- Caching opportunities
- Load or scalability concerns

Performance improvements should be measured when performance is a meaningful requirement or risk.

## 6. Accessibility Review

For user-facing interfaces, review relevant accessibility behavior.

Check where applicable:

- Keyboard accessibility
- Semantic HTML
- Labels and accessible names
- Focus behavior
- Form accessibility
- Appropriate contrast
- Screen-reader considerations
- Error messaging

## 7. Analytics Review

Confirm that required analytics behavior is implemented.

Check:

- Required events are tracked.
- Event names follow project conventions.
- Important CTA interactions are tracked.
- Completed actions are tracked where required.
- No unnecessary sensitive information is sent to analytics.

## 8. Documentation Review

Documentation should be updated when the change affects:

- Setup
- Configuration
- APIs
- Architecture
- User-facing behavior
- Operational procedures
- Deployment
- Technical decisions

Documentation must match the actual implementation.

## 9. AI-Assisted Code Review

When AI was used during development, AI review may be used as an additional review aid.

AI should be asked to identify:

- Bugs
- Security problems
- Poor naming
- Duplicate code
- Complex code
- Missing error handling
- Missing tests
- Performance problems
- Accessibility problems
- Type problems

AI findings are suggestions and must be reviewed by a human.

The Technology Owner decides what should actually change.

AI review does not replace human code review.

## Peer Polish (Human Review)

Peer Polish is the required review by another person before a feature Pull Request is merged into `development`. Its purpose is to catch problems and improve clarity, correctness, maintainability, and delivery quality while the change is still easy to revise.

### Participants

- **Author:** Opens and updates the feature Pull Request, explains the change, and responds to review feedback.
- **Peer reviewer:** A person other than the author who has the repository access required to review and approve the Pull Request.
- **Technology Owner:** Resolves technical disagreements or risks that the author and reviewer cannot resolve. The Technology Owner does not replace independent review when branch protection requires another reviewer.

### Process

1. The author pushes the feature branch and opens a Pull Request targeting `development` with the requirement/task, summary, and validation evidence.
2. A peer reviews the requirement fit, implementation, tests, security, and relevant operational impact using this standard.
3. The reviewer leaves specific, respectful, actionable comments. The author addresses them with changes or discusses why a change is unnecessary.
4. The reviewer requests changes while blocking concerns remain; otherwise, the reviewer approves the Pull Request.
5. Merge only after the required human approval and required CI checks pass, and blocking comments are resolved.

If no eligible peer reviewer is available, leave the Pull Request open and request one; do not substitute AI review or self-approval for the required human approval.

Peer approval confirms technical review of the change. It is not Product Acceptance, release approval, or proof that the feature has been deployed.

## 10. Pull Request Requirements

A Pull Request should provide enough information for reviewers to understand and validate the change.

Include where applicable:

- Requirement or task reference
- Summary of changes
- Implementation notes
- Testing performed
- CI results
- Screenshots or evidence for UI changes
- Deployment considerations
- Known risks or limitations

## 11. Review Comments

Review comments should be:

- Clear
- Specific
- Respectful
- Actionable
- Related to the change

Comments identifying correctness, security, testing, or release risks should be resolved before merge.

Do not ignore important review feedback without agreement from the responsible reviewer or Technology Owner.

## 12. Approval Checklist

Before approval, verify:

- Requirement met
- Code quality good
- Tests present where required
- Security checked
- Performance considered
- Analytics considered
- Documentation updated where necessary
- CI checks pass
- Review comments resolved

## 13. Merge Readiness

Code is ready to merge when:

- The requirement has been validated.
- Self-check is complete.
- AI review has been completed where AI-assisted review is appropriate.
- Human review is complete.
- Required automated checks pass.
- Required tests pass.
- Security concerns are addressed.
- Important review comments are resolved.
- The Technology Owner approves the result.

## Key Principle

> No merge without appropriate review and validation.
