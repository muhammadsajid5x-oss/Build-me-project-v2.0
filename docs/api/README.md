# Build Me API Foundation

The Build Me API uses an API-first delivery process. Each API operation must be understood, contracted, and designed before implementation begins. The contract is the source of truth for the implementation, automated tests, and API consumers.

## API Lifecycle

```text
Child Story Requirement
	↓
Does it need an API?
  ├─ NO → Record the decision; continue the Child Story without an API contract.
  └─ YES
	↓
Define API Contract
	↓
Review Contract
	↓
Save Contract
	↓
Create Postman Request
	↓
Create API Test
	↓
Implement API
	↓
Run Automated Test
	↓
Integrate Consumer
```

The API test is defined from the reviewed contract before implementation; it is executed against the implementation after the API is built. Complete and review the API Design before implementation as required by the API lifecycle below.

## Stage Gates

### 1. Requirement and API Decision

Start from an approved Child Story and its acceptance criteria. Record the user outcome, scope, constraints, dependencies, and open questions. Decide explicitly whether the story requires an API. If not, record the decision and do not create an unnecessary API contract. Do not infer undocumented product behavior.

**Exit gate:** the requirement and its source are identified; unknowns are recorded and assigned for confirmation.

### 2. API Contract

Define the consumer-visible contract before choosing implementation details. Specify the route, method, version, request, success response, error responses, validation, authentication/authorization requirements, and compatibility expectations. Mark any undecided behavior **Needs Confirmation**.

Use the [API contract template](contract-template.md) and save the reviewed artifact under `docs/api/contracts/`.

**Exit gate:** the API consumer and responsible owners approve the contract, or explicitly track each unresolved item with an owner. Implementation must not start with unapproved or guessed contract behavior.

### 3. Review and Save Contract

Review the contract with the API owner and consumer owner. Save the agreed version under `docs/api/contracts/` before implementation. If review changes the method, path, request, response, validation, error, or permission behavior, update the contract and review it again.

### 4. Create Postman Request

Create a Postman request from the saved contract, including method, URL, headers, body when required, and a saved example response. Save collections under `docs/api/postman/collections/` and use the appropriate environment from `docs/api/postman/environments/`. Do not store credentials or other secrets in the repository.

### 5. Create API Test

Define an automated API test from the same contract before implementation. Cover success, validation, errors, permissions, and relevant edge cases. Keep test expectations independent of unapproved implementation behavior. Execute the test after implementation and record results.

### 6. API Design

Map the approved contract onto the existing Build Me API foundation. Identify the route, middleware, validator, service, data access, shared types, error handling, security, and operational responsibilities that apply. Reuse existing architecture first; justify any genuinely new capability.

Use the [API design template](design-template.md) and save the reviewed artifact under `docs/api/design/`.

**Exit gate:** the design traces each contract behavior to an implementation responsibility, and dependencies, migrations, risks, and unknowns are reviewed before coding.

### 7. Implementation

Implement only the approved contract and design. Do not silently change a request, response, status, security rule, or product behavior. Update the contract/design first when a necessary change is discovered, then obtain the required review.

### 8. Automated Test Execution

Test implementation against the contract, including success behavior, validation failures, error responses, authorization/security behavior where applicable, and relevant edge cases. Run the agreed API, integration, type, and CI checks; record results.

### 9. Integration

Integrate the API with its documented consumers using the approved contract. Verify request/response compatibility, relevant user journeys, environment configuration, and failure behavior. Record integration evidence and unresolved follow-up.

## Artifact Locations

- API contracts: `docs/api/contracts/`
- API designs: `docs/api/design/`
- Postman collections, environments, contracts, and examples: `docs/api/postman/`
- Reusable contract format: [contract-template.md](contract-template.md)
- Reusable design format: [design-template.md](design-template.md)
- Rules: [API standards](standards.md)

## Core Rule

> Do not start API implementation before the API contract is agreed. Define the contract, create its Postman request and API test, and review the API design first; then implement, execute tests, and integrate consumers against the agreed contract.
