# Central Testing Structure

The `tests/` directory defines the repository testing structure by
**what is being tested**.

Testing tools such as Vitest, Jest, Playwright, Cypress, and Postman
support these test categories. They do not determine the directory
structure.

## Structure

```text
tests/
├── api/
├── integration/
├── e2e/
├── performance/
├── security/
└── analytics/
```

## Unit Testing Standard

Unit tests verify isolated application logic and should be fast,
deterministic, and independent of external systems.

### JavaScript / TypeScript

Use **Jest** for JavaScript and TypeScript unit testing.

Jest is used for:

- Frontend logic
- Backend logic
- Shared package logic
- Utility functions
- Validation logic
- Business rules

### Python

Use **pytest** for Python unit testing.

pytest is used for:

- Analytics logic
- Data processing
- Calculations
- Python business logic

### Principle

Unit tests should focus on one unit of behavior at a time.

They should avoid depending on:

- Production databases
- External APIs
- Real authentication providers
- Network services
- Production credentials
