# Prompt 9 — Generate Tests
## Prompt
> Create tests for this code. Include normal cases, error cases, empty cases and important edge cases. Use the testing tools and patterns already used by this project.
## Purpose
Use this prompt to identify and create appropriate automated test coverage.
## Consider
- Happy paths
- Error paths
- Empty states
- Loading states where applicable
- Edge cases
- Security cases where applicable
- Important user journeys
## Project Testing Tools
Use the appropriate existing project tools, including:
- Jest
- Storybook tests
- Jest + SuperTest
- Cypress
## Rule
Generated tests must be reviewed and executed.
## Workflow
Requirement → Test Scenarios → Automated Tests → Execute → Validate
