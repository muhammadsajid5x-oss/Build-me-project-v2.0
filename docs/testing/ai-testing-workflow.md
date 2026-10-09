# AI Testing Workflow

## Purpose

AI can assist the Technology Owner in identifying test scenarios and improving test coverage.

AI helps determine what should be tested, but the actual automated tests must be created, executed, and verified.

## Technology Principle

> AI suggests tests. Automated tests provide evidence.

AI output must never be treated as proof that the system works.

## What AI Should Help Identify

When reviewing a requirement or implementation, use AI to identify:

### 1. What Should Be Tested

Ask AI to identify:

- Required functionality
- Expected behavior
- Acceptance criteria
- Important system interactions
- Expected outcomes

### 2. Happy Paths

Identify scenarios where:

- Valid input is provided
- Expected actions are completed
- Normal workflows succeed
- Expected results are returned

### 3. Error Paths

Identify scenarios involving:

- Invalid input
- Failed requests
- Missing data
- Permission failures
- External service failures
- Unexpected conditions

### 4. Empty States

Identify situations where:

- No data exists
- A list is empty
- A search returns no results
- A user has no previous activity
- Optional content is unavailable

### 5. Loading States

For user interfaces, identify:

- Initial loading
- Slow responses
- Pending operations
- Loading indicators
- Disabled actions during loading

### 6. Edge Cases

Identify:

- Boundary values
- Empty values
- Null or undefined values
- Very large inputs
- Very small inputs
- Duplicate values
- Unexpected sequences
- Unusual user behavior

### 7. Security Cases

Identify relevant scenarios involving:

- Authentication
- Authorization
- Input validation
- Access control
- Sensitive data exposure
- Unsafe input
- Rate limiting where applicable
- Security boundaries

Do not provide passwords, API keys, tokens, or private credentials to AI.

### 8. User Journeys

Identify complete user journeys such as:

- User enters the application
- User performs an action
- System processes the request
- User receives the expected result
- User encounters an error
- User recovers from the error

## AI Testing Questions

Use AI to ask:

> What should be tested for this requirement?

Then:

> Identify the happy paths.

Then:

> Identify the error paths.

Then:

> Identify empty and loading states.

Then:

> Identify edge cases.

Then:

> Identify relevant security cases.

Then:

> Identify the most important user journeys.

The Technology Owner reviews the proposed scenarios before converting them into tests.

## Test Planning

AI-generated test ideas should be converted into a test plan containing:

- Requirement
- Scenario
- Expected result
- Test type
- Priority
- Relevant test tool
- Acceptance criteria covered

## Automated Testing

Create actual automated tests where applicable.

### Unit Tests

Use Jest for isolated functions, utilities, business logic, and other appropriate units.

Verify:

- Normal behavior
- Error behavior
- Boundary conditions
- Important edge cases

### Component Tests

Use Storybook tests for appropriate UI components.

Verify:

- Rendering
- User interactions
- Component states
- Loading states
- Empty states
- Error states
- Accessibility-related behavior where applicable

### Integration Tests

Use Jest + SuperTest for appropriate API and service integration testing.

Verify:

- API requests
- Responses
- Validation
- Error handling
- Authentication and authorization where applicable
- Integration between relevant services

### End-to-End Tests

Use Cypress for appropriate complete user journeys.

Verify:

- Realistic user workflows
- Navigation
- User interactions
- Important success journeys
- Important failure journeys
- Critical acceptance criteria

## Test Selection

Not every scenario requires every testing tool.

Select the appropriate test level based on the behavior being validated.

Example:

```text
Business logic
    ↓
Jest unit test

UI component
    ↓
Storybook test

API integration
    ↓
Jest + SuperTest

Complete user journey
    ↓
Cypress E2E
```
