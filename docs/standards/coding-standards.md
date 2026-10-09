# Coding Standards

## Purpose

These standards define how Technology code is written in the Build Me project.

The goal is to keep code:
- Readable
- Maintainable
- Consistent
- Testable
- Secure
- Easy to review

## 1. Naming

Use clear and meaningful names.

### Variables

Use descriptive names that clearly communicate their purpose.

### Functions

Use verb-based names that describe the action being performed.

Examples:
- getUserProfile()
- calculateTotal()
- validateUser()
- createProject()

### Components

React components use PascalCase.

Examples:
- UserProfile.tsx
- ProjectCard.tsx
- NavigationBar.tsx

### Types

TypeScript types and interfaces use clear PascalCase names.

## 2. File Structure

Keep files focused and organized.

Follow the Build Me monorepo structure:
- Applications belong in apps/.
- Shared packages belong in packages/.
- Database code belongs in the database package.
- Tests belong in appropriate test directories.
- Documentation belongs in docs/.
- Engineering standards belong in docs/standards/.
- Technology AI resources belong in technology-ai/.

Avoid placing unrelated responsibilities in the same file.
Prefer small, focused modules.

## 3. Functions

Functions should have one clear responsibility.

Functions should:
- Have clear names
- Have focused responsibilities
- Have understandable parameters
- Avoid unnecessary side effects
- Be easy to test
- Return predictable results

Avoid unnecessarily long functions and excessive nesting.

## 4. Components

React components should have a clear responsibility.

Components should:
- Use typed props
- Be reusable where appropriate
- Keep rendering logic understandable
- Handle relevant states clearly
- Be easy to test

Avoid putting unrelated business logic into UI components.
Move reusable logic into appropriate hooks, services, functions, or utilities where appropriate.

## 5. Types

Use TypeScript to make contracts explicit.

Prefer specific types over any.

Use types for:
- Function parameters
- Component props
- API contracts
- Important data structures
- Shared domain models

Avoid unnecessary type duplication.

## 6. Error Handling

Handle errors deliberately.

Errors should:
- Be detected
- Be handled at the appropriate boundary
- Provide useful information
- Avoid exposing secrets
- Provide enough context for debugging

Do not silently ignore errors.
Do not expose passwords, tokens, API keys, database credentials, or other sensitive information in errors or logs.

## 7. Comments

Use comments to explain important reasoning.

Good comments explain:
- Why something is done
- Important constraints
- Non-obvious business rules
- Necessary workarounds

Avoid comments that simply repeat the code.
Prefer readable code over excessive comments.

## 8. Clean Code

Follow Clean Code principles.

Code should be:
- Clear
- Focused
- Readable
- Predictable
- Easy to test
- Easy to change

Avoid:
- Dead code
- Unnecessary duplication
- Meaningless names
- Very long functions
- Very large components
- Deep unnecessary nesting
- Unused imports
- Unused variables

## 9. SOLID

Apply SOLID principles where they improve maintainability.

### Single Responsibility
A module, class, function, or component should have a clear responsibility.

### Open/Closed
Prefer designs that can be extended without unnecessarily modifying stable code.

### Liskov Substitution
Implementations should behave consistently with their contracts.

### Interface Segregation
Prefer focused interfaces over large interfaces containing unrelated responsibilities.

### Dependency Inversion
Separate high-level business logic from unnecessary low-level implementation details where appropriate.

Do not apply SOLID mechanically. Use engineering judgment.

## 10. DRY

Follow Don't Repeat Yourself.

Avoid unnecessary duplication of:
- Business logic
- Validation rules
- Shared constants
- Reusable UI behavior
- Common utilities

Do not create abstractions prematurely. Clarity is more important than forced reuse.

## 11. KISS

Follow Keep It Simple.

Prefer:
- Straightforward solutions
- Small functions
- Clear control flow
- Familiar patterns
- Minimal unnecessary abstraction

Avoid unnecessary complexity.

## 12. Code Quality Before Review

Before code is ready for review:
- Formatting should pass
- Linting should pass
- Type checking should pass
- Relevant tests should pass
- Errors should be handled appropriately
- No secrets should be committed
- Code should follow these standards
- Documentation should be updated where necessary

## 13. Review Principle

Code should be understandable by another Technology Owner.

Ask:
> Can another engineer understand, test, maintain, and safely change this code?

If not, improve the implementation before merging.

## Key Principle

> Write code that is clear, simple, maintainable, testable, and safe.
