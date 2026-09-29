# Build Me API Standards

## Purpose

The Build Me API follows an API-first architecture.

API contracts must be defined and reviewed before implementation begins.

## API Development Lifecycle

Child Story Requirement
↓
Decide whether an API is required
↓
Define, review, and save API Contract
↓
Create Postman Request and API Test from the contract
↓
Review API Design
↓
Implement API
↓
Execute Automated Test
↓
Consumer Integration

## Core Rule

> Do not build the API first and document it afterwards.

The API contract is the source of truth for frontend and backend integration.

---

# 1. Endpoint Naming

Endpoints must use:

- lowercase
- plural resource names
- nouns rather than actions
- hyphen-separated words when required

Examples:

GET /api/v1/users
GET /api/v1/projects
GET /api/v1/analytics-events

Avoid:

GET /api/v1/getUsers
POST /api/v1/createProject
POST /api/v1/deleteUser

HTTP methods should express the operation.

---

# 2. HTTP Methods

## GET

Retrieve resources.

```http
GET /api/v1/projects
GET /api/v1/projects/{id}
```

## POST

Create a resource or submit an operation whose semantics require a request body.

```http
POST /api/v1/projects
```

## PUT

Replace a resource when the contract defines full replacement semantics.

## PATCH

Partially update a resource when the contract defines which fields may change.

## DELETE

Delete or deactivate a resource only when that behavior is explicitly defined by the requirement and contract.

---

# 3. Request and Response Structure

- Use JSON for request and response bodies unless the contract requires another media type.
- Define every field's type, required/optional status, constraints, and meaning in the contract.
- Use ISO 8601 timestamps with timezone information when timestamps are part of the contract.
- Do not return fields that the consumer does not need or is not authorized to receive.
- Keep response shapes consistent within an API version; do not infer shapes from current implementation.

---

# 4. Status Codes and Errors

Choose status codes that match the documented outcome. Define success and expected error status/body pairs in the API contract before implementation.

- `2xx`: the contracted operation succeeded.
- `4xx`: the request is invalid, unauthenticated, unauthorized, or targets a missing resource, as specified by the contract.
- `5xx`: the service could not complete a valid request due to an unexpected server-side failure.

Error responses must use a stable, documented shape and safe public messages. Never expose stack traces, database internals, secrets, or sensitive diagnostic details. Keep detailed diagnostics in appropriately protected, redacted logs.

---

# 5. Validation

- Validate untrusted input at the API boundary.
- Enforce the field types, requiredness, formats, lengths, ranges, and allowed values stated in the contract.
- Reject invalid input consistently and return the contracted error response.
- Do not silently invent normalization or coercion rules; document and approve them in the contract.

---

# 6. Authentication and Authorization

Authentication establishes the caller's identity; authorization determines whether that caller may perform the operation. Specify both in the contract. Public/anonymous access must be explicit rather than assumed. Enforce authorization server-side and return only data the caller is allowed to access.

---

# 7. Versioning and Compatibility

- Use the existing `/api/v1` route prefix for versioned endpoints unless an approved design specifies otherwise.
- Do not make a breaking contract change without a versioning and consumer migration plan.
- Keep implementation, automated tests, and consumer integration aligned with the approved contract version.

---

# 8. Testing and Integration

- Define automated tests from contract success, validation, error, security, and edge-case behavior before implementation.
- Execute those tests against the implementation before integration and promotion.
- Verify implementation responses against the contract; tests must not merely duplicate implementation assumptions.
- Integrate consumers only against the reviewed contract and verify end-to-end request/response behavior.
- Run the agreed CI and test gates before promoting the API.

---

# 9. API Change Gate

Before implementation, confirm that the source requirement, API contract, and API design are reviewed. Unknown behavior must be marked **UNKNOWN** or **NEEDS CONFIRMATION** and resolved or explicitly owned; it must not be guessed to make implementation appear ready.
