# 4.2 DESIGN Foundation — Submit a Lead Through the Public Website

> **Design exercise only.** This is a proposed technical design based on the supplied Child Story and repository documentation. It does not authorize implementation, claim implementation, testing, or deployment, or constitute Product acceptance. Every unresolved detail is marked **Needs Confirmation**.

## 1. Design Purpose

### What is being designed?

A high-level technical solution for the public website lead-submission flow: collect the supplied contact fields, send a valid submission to an API, validate and persist it, return a result, and show visitor confirmation or a safe failure.

### What problem does the design solve?

It turns the known user and system outcomes into component responsibilities, data/API boundaries, failure handling, verification needs, and delivery considerations before any BUILD work begins. It also makes unresolved decisions visible so they are not silently invented during implementation.

### Why design happens before BUILD

The Build Me engineering guidance says to understand and document requirements before implementation; its API guidance also says not to build an API before documenting its contract. Designing first lets Product-owned questions be separated from Technology-owned technical choices, and lets teams review risks and testability before code exists.

### Design scope

- The supplied public lead-capture submission and confirmation flow.
- The named request path through frontend, API, validation, service/application layer, and database.
- Required error handling, logging, security, testing, deployment, and operational considerations.
- The stated Analytics and Admin Dashboard journey touchpoints only to identify dependencies and unknown ownership/scope.

### Outside design scope

- Production code, schema migrations, deployment, or configuration changes.
- Product decisions about UX, success criteria, analytics meaning, notifications, CRM, routing, or Admin Dashboard behavior.
- Selection of endpoint names, table names, exact validation rules, analytics event names, authentication, or specific technologies not established by the inputs.
- Product acceptance. That remains Product Ownership’s responsibility.

## 2. Design Inputs

### Known

| Input                          | Known information used                                                                                                                                                                                                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product requirement            | A public visitor submits contact information and an enquiry for follow-up. Valid information is sent to an API, validated, persisted, and followed by a successful response and visitor confirmation.                                                                             |
| Child Story                    | “Submit a Lead Through the Public Website,” under “Lead Capture & Routing.”                                                                                                                                                                                                       |
| Required and optional data     | Required: name, email, message. Optional: phone, company. A stored lead has submitted information, a unique ID, and a timestamp.                                                                                                                                                  |
| Failure behavior               | Missing/invalid input is rejected. Database failure must not expose internal technical details and must be logged for technical investigation.                                                                                                                                    |
| AI Understanding               | The planning record states the user outcome, core system flow, known failure cases, and unresolved questions without selecting technologies.                                                                                                                                      |
| Technical Requirements         | The planning record identifies frontend form, API, database, security, testing, observability, and deployment concerns.                                                                                                                                                           |
| Technical Tasks                | The planning record groups proposed follow-up tasks under Frontend, API, Database, Testing, Security, and Operations/Deployment.                                                                                                                                                  |
| Existing architecture          | Repository documentation describes a PNPM/Turbo monorepo with web and dashboard applications, API service, shared packages, database layer, tests, and CI workflows. This indicates available repository areas; it does not prove this story already has components or contracts. |
| Existing API standards         | API documentation calls for an API-first lifecycle and identifies endpoint naming, HTTP methods, request/response shape, status codes, validation, errors, and versioning as contract concerns. It gives no endpoint for this story.                                              |
| Existing security requirements | The story explicitly requires safe database-failure responses and investigation logging. Broader security policy is documented separately; story-specific controls remain subject to review.                                                                                      |
| Existing deployment guidance   | Repository deployment guidance describes CI quality gates, build, environment deployment, health/smoke validation, and monitoring as lifecycle stages. It does not prescribe this story’s release plan.                                                                           |

### Needs Confirmation

- Product acceptance criteria and measurable definition of success.
- UX details for form layout, accessibility, field guidance, confirmation, and errors.
- Exact API endpoint, method, version, request/response schema, and error contract.
- Field formats, limits, normalization, validation ownership, and rejection details.
- Database entity/schema, identifier strategy, timestamp semantics, retention, and migration needs.
- Whether analytics instrumentation is part of this Child Story; events, properties, consent, and measures.
- Whether public submission is anonymous and what authentication/authorization applies, if any.
- Whether CRM, lead routing, staff notifications, or Admin Dashboard work is in this story or another story.
- Threat model, abuse protections, privacy/consent, and sensitive-data retention.
- Performance, availability, and traffic targets.
- Logging fields, redaction, destination, access, retention, alerts, and operational owners.
- Deployment environments, configuration, migration ordering, rollout, rollback, and post-release observation.

## 3. AI-Assisted Design Analysis

AI is used here as a **design support tool**: it organizes requirements into components and boundaries, traces data and failure paths, identifies relevant repository architecture and standards, proposes a reviewable high-level structure, and exposes missing information. AI is not choosing product outcomes, asserting undocumented contracts, generating code, or approving the design.

| Design concern                   | Analysis                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Required components              | Public lead-capture UI; API boundary; request validation; application/service responsibility for coordinating persistence; database; safe error handling; technical logging; and, only if confirmed, analytics and Admin Dashboard integration.                                                                                                             |
| Component responsibilities       | UI collects and presents state. API accepts the request and enforces confirmed server-side validation. Application/service layer coordinates valid lead creation and persistence. Database stores the agreed lead record. Error handling returns safe responses. Logging supports investigation. Analytics and dashboard responsibilities remain undefined. |
| Data flow                        | Visitor values travel from UI to API, are validated, and on success are persisted with an ID and timestamp. A result returns to UI, which displays confirmation or an error state. Exact serialization and result shape need confirmation.                                                                                                                  |
| API needs                        | An API is explicitly required, but route, method, version, contract, auth, status codes, and error format are not supplied. Document and review a contract before BUILD.                                                                                                                                                                                    |
| Database needs                   | Persistence is explicitly required, including submitted information, unique ID, and timestamp. Schema, field types, constraints, ID generation, timestamp semantics, and migration are unknown.                                                                                                                                                             |
| Security considerations          | Enforce confirmed validation at the API boundary; avoid returning internal failure details; handle submitted contact information carefully; define log redaction. Other controls require threat and privacy review.                                                                                                                                         |
| Testing considerations           | Cover valid submission, required-field rejection, optional fields, persistence failure and safe error, visitor states, API/network failure once defined, and logging behavior. Add analytics/security/performance cases only when requirements are agreed.                                                                                                  |
| Deployment considerations        | Follow the existing lifecycle: build and CI gates, environment/config validation, deployment, health/functional validation, and monitoring. Target, migration, rollout, and rollback remain unknown.                                                                                                                                                        |
| Operational considerations       | Database failure must be investigable. Define additional logs, metrics, alerts, dashboards, owners, retention, and post-release observation before implementation.                                                                                                                                                                                          |
| Dependencies                     | Product/UX decisions; API contract review; database schema and migration review; security/privacy review; analytics ownership/consent decision; environment/configuration readiness. Specific owners and sequencing need confirmation.                                                                                                                      |
| Technical risks                  | UI/API contract mismatch; unclear validation; persistence failure; disclosure of internals or sensitive data; duplicate submission behavior; analytics scope ambiguity; unobservable failures; deployment/config mismatch.                                                                                                                                  |
| Missing information              | The items in the Needs Confirmation list above, including all named endpoint, schema, analytics, identity, CRM, notification, and performance details.                                                                                                                                                                                                      |
| Decisions requiring confirmation | Product-owned behavior and acceptance; endpoint and schema contracts by relevant technical owners; identity/access/security by accountable owners; analytics scope and consent by Product/Analytics; rollout and operations by Technology Ownership.                                                                                                        |

## 4. Proposed Architecture

The following is a logical design, not an implemented topology. The lead service/application layer is shown as a responsibility boundary; whether it maps to a distinct deployable component is **Needs Confirmation**.

```text
Visitor
  ↓
Lead Capture UI
  ↓ submit
API boundary ───────────────→ Safe error response → Lead Capture UI
  ↓                              ↑
Request validation ── invalid ───┘
  ↓ valid
Lead service / application responsibility
  ├── persist lead → Database
  ├── report technical failure → Logging / investigation
  └── Analytics integration → only if scope and event contract are confirmed
                                 ↓
                         Monitoring / operations

Successful API response → Lead Capture UI → Visitor confirmation
```

The named Admin Dashboard is a downstream journey destination, but its data access and behavior are not specified. Its integration is therefore a dependency/scope question, not an assumed component in this submission request path.

| Component                               | Responsibility                                                                         | Input                                                  | Output                                                 | Dependencies                                                                                              |
| --------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Visitor                                 | Supplies the enquiry and contact details.                                              | Form fields and user action.                           | Submission intent and entered values.                  | Confirmed form experience and public access rules.                                                        |
| Lead Capture UI                         | Presents required/optional fields, submits data, and presents result states.           | Visitor-entered values; API result.                    | API request; success confirmation or safe error state. | UX/accessibility decisions; API contract; frontend environment configuration.                             |
| API boundary                            | Receives the submission and coordinates the request lifecycle.                         | Request from UI.                                       | Success or defined validation/technical response.      | Endpoint and contract **Needs Confirmation**; validation and security policy.                             |
| Request validation                      | Rejects missing/invalid information using rules agreed by owners.                      | Parsed request data.                                   | Validated data or validation result.                   | Exact rules and error contract **Needs Confirmation**.                                                    |
| Lead service/application responsibility | Coordinates valid lead persistence and any confirmed downstream work.                  | Validated lead data.                                   | Persistence result; optionally confirmed integrations. | Service boundaries and CRM/routing/analytics scope **Needs Confirmation**.                                |
| Database                                | Persists the agreed lead fields, unique ID, and timestamp.                             | Validated lead record.                                 | Persistence success or failure.                        | Schema, constraints, identifier and timestamp semantics, configuration, migration **Needs Confirmation**. |
| Error handling                          | Maps validation and technical failures to safe external responses.                     | Validation/persistence result or exception.            | Agreed response; internal diagnostic signal.           | Error contract, failure classification, redaction rules **Needs Confirmation**.                           |
| Logging                                 | Records database failures for investigation without exposing internals to the visitor. | Technical failure and permitted context.               | Protected diagnostic record.                           | Logging platform, fields, redaction, access, and retention **Needs Confirmation**.                        |
| Analytics                               | Handles events only if this story is confirmed to require them.                        | Confirmed user/system events and permitted properties. | Agreed analytics records.                              | Event schema, consent/privacy, ownership, delivery/failure behavior **Needs Confirmation**.               |
| Monitoring/operations                   | Makes agreed service health and failure signals visible after release.                 | Logs and any confirmed metrics/analytics.              | Dashboards, alerts, investigation/recovery signals.    | Signals, thresholds, owner, tooling, and observation period **Needs Confirmation**.                       |

## 5. Data Flow Design

1. **Visitor enters information.** The visitor enters required name, email, and message, and may enter phone and company. Exact UI behavior is **Needs Confirmation**.
2. **Frontend validates the submission.** The UI may provide immediate validation, but exact rules and whether client-side validation is required are **Needs Confirmation**. Client validation must not be treated as a replacement for API validation.
3. **Frontend sends the request.** It sends the submission to the API. Endpoint, method, serialization, timeout, and retry behavior are **Needs Confirmation**.
4. **API receives the request.** The API boundary accepts the request under the agreed public access/authentication model. That model is **Needs Confirmation**.
5. **API validates the request.** It rejects missing/invalid data; exact constraints and validation response are **Needs Confirmation**.
6. **Valid data reaches the application/service responsibility.** That responsibility coordinates lead creation and persistence. Whether it is a separate module/service is **Needs Confirmation**.
7. **Lead is persisted.** The database stores submitted information with a unique ID and timestamp. Schema, ID strategy, timestamp semantics, and transaction behavior are **Needs Confirmation**.
8. **API returns the result.** Success is returned after persistence. Status, body, and failure response contract are **Needs Confirmation**.
9. **Frontend displays confirmation/error.** It shows confirmation after success and an error for rejected or failed submissions. Content and interaction details are **Needs Confirmation**.
10. **Technical failures are logged.** Database failure must be logged for investigation; safe fields, redaction, and retention are **Needs Confirmation**.
11. **Analytics/observability are handled where required.** The journey names Analytics; events, consent, measures, operational metrics, and alerting need confirmation before adding instrumentation.

| Step                         | Component                               | Input                            | Processing                                | Output                                        | Failure                                                                                                                                       |
| ---------------------------- | --------------------------------------- | -------------------------------- | ----------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Enter information         | Lead Capture UI                         | Visitor-provided values          | Collect required and optional fields      | Draft submission                              | UI interaction/field behavior not defined; confirm UX and accessibility requirements.                                                         |
| 2. Frontend validation       | Lead Capture UI                         | Draft submission                 | Apply any agreed immediate checks         | Submission proceeds or field feedback appears | Exact rules and client-side responsibility **Needs Confirmation**.                                                                            |
| 3. Send request              | Lead Capture UI                         | Submission values                | Send using agreed API contract            | API request                                   | Network timeout/retry and user feedback **Needs Confirmation**.                                                                               |
| 4. Receive request           | API boundary                            | API request                      | Parse/accept according to access policy   | Parsed request                                | Auth/public access, payload limits, and malformed-body response **Needs Confirmation**.                                                       |
| 5. Validate                  | API validation                          | Parsed request                   | Check required and confirmed constraints  | Validated data or validation error            | Missing/invalid data is rejected; exact response contract **Needs Confirmation**.                                                             |
| 6. Coordinate creation       | Lead service/application responsibility | Validated data                   | Coordinate persistence                    | Persistence request/result                    | Boundary and transaction responsibilities **Needs Confirmation**.                                                                             |
| 7. Persist                   | Database                                | Lead data                        | Store fields plus unique ID and timestamp | Stored lead or storage failure                | Database failure: do not report success; send safe external error and log investigation details. Schema/ID/time rules **Needs Confirmation**. |
| 8. Return API result         | API/error handling                      | Persistence or validation result | Map to agreed response                    | Success or error response                     | Status/body, retry/idempotency, and other technical failure behavior **Needs Confirmation**.                                                  |
| 9. Present result            | Lead Capture UI                         | API result                       | Display agreed state                      | Visitor confirmation or error                 | UI content, retry, and duplicate-submit behavior **Needs Confirmation**.                                                                      |
| 10. Record technical failure | Logging                                 | Database failure context         | Redact and record permitted diagnostics   | Investigation log                             | Logging destination, fields, access, retention, and logging failure handling **Needs Confirmation**.                                          |
| 11. Analytics/observe        | Analytics/monitoring, if confirmed      | Agreed events/signals            | Record and expose agreed measures         | Analytics/operational signals                 | Whether this story emits analytics, event contract, consent, delivery behavior, metrics, alerts **Needs Confirmation**.                       |

## 6. API Design

This is conceptual only. The endpoint and contract are not in the supplied requirements.

| Item                 | Conceptual design                                                                                                                                                                    | Status                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Purpose              | Accept a visitor lead submission, validate it, persist it, and return a result the UI can present.                                                                                   | Supported by the known flow.                                                                            |
| HTTP method          | An HTTP request is implied by sending a request to an API. The method is not specified.                                                                                              | **Needs Confirmation**                                                                                  |
| Endpoint requirement | A public lead-submission endpoint is required conceptually. Do not select or document a route name until agreed.                                                                     | **Needs Confirmation**                                                                                  |
| Request structure    | Required fields: name, email, message. Optional fields: phone, company. Exact property names, types, encoding, and constraints are unspecified.                                      | **Needs Confirmation**                                                                                  |
| Success response     | Signal successful persistence so the frontend can show confirmation.                                                                                                                 | Exact status, body, and identifier exposure: **Needs Confirmation**                                     |
| Validation           | Reject missing or invalid required information and any other invalid values under rules agreed by owners.                                                                            | Exact validation rules and field-level error format: **Needs Confirmation**                             |
| Error handling       | Database failure must not expose internal technical details. Other error mapping is unspecified.                                                                                     | Error statuses, messages, correlation mechanism, and retry/idempotency behavior: **Needs Confirmation** |
| Logging              | Database failure must be logged for technical investigation.                                                                                                                         | Safe fields, redaction, correlation, destination, access, and retention: **Needs Confirmation**         |
| Security             | Validate at the API boundary and return safe errors. Public access/authentication, authorization, abuse controls, payload constraints, privacy, and rate limiting are not specified. | **Needs Confirmation** before adopting controls as story requirements.                                  |

## 7. Data Design

The logical entity is a lead because the supplied story says the lead is stored. This does not select a database table name or physical schema.

| Field             | Required?         | Purpose                                                 | Validation/Constraint                                                                                                               | Status                 |
| ----------------- | ----------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Lead entity       | Yes, conceptually | Represents a submitted enquiry available for follow-up. | Physical representation and lifecycle not defined.                                                                                  | **Needs Confirmation** |
| Unique identifier | Yes               | Uniquely identifies the stored lead.                    | Format, generation, uniqueness scope, and exposure not defined.                                                                     | **Needs Confirmation** |
| Name              | Yes               | Identifies the person submitting the enquiry.           | Exact type, trimming, length, character policy, and validation not defined.                                                         | **Needs Confirmation** |
| Email             | Yes               | Contact information for follow-up.                      | Syntax policy, normalization, length, verification, and uniqueness are not defined. Do not assume email verification or uniqueness. | **Needs Confirmation** |
| Phone             | No; optional      | Additional contact information if supplied.             | Format, normalization, length, and omitted/null behavior not defined.                                                               | **Needs Confirmation** |
| Company           | No; optional      | Organization context if supplied.                       | Type, length, and omitted/null behavior not defined.                                                                                | **Needs Confirmation** |
| Message           | Yes               | Records the visitor’s enquiry.                          | Type, length, allowed content, sanitization, and storage policy not defined.                                                        | **Needs Confirmation** |
| Created timestamp | Yes               | Records when the lead was submitted/stored.             | Whether this is submission or persistence time, timezone, precision, and source of time not defined.                                | **Needs Confirmation** |

Database engine/table, column types, indexes, retention/deletion, encryption, migration, audit history, and backup/recovery details are all **Needs Confirmation**. No schema is proposed here.

## 8. Security Design

### Confirmed requirements

- Reject missing or invalid information; exact rules remain **Needs Confirmation**.
- Database failure must not expose internal technical details to the visitor.
- Technical failure should be logged for investigation.

### Recommendations for review — not confirmed requirements

- **Input validation:** Define field constraints and enforce confirmed rules at the API boundary. Which constraints apply is **Needs Confirmation**.
- **Malformed input:** Agree how malformed bodies, unsupported content types, oversized requests, and unexpected types are handled. Limits and responses are **Needs Confirmation**.
- **Safe error responses:** Return a stable, non-sensitive external error for storage failure; never return raw database messages, stack traces, credentials, or internal diagnostics.
- **Sensitive information:** Treat name, email, phone, company, and message as potentially sensitive contact/enquiry data for design review. Classification, consent, retention, access, and deletion requirements are **Needs Confirmation**.
- **Secrets/configuration:** Keep database/API credentials in deployment-managed secret configuration, not in client code or logs. Actual configuration mechanism, environments, and owners are **Needs Confirmation**.
- **Rate limiting:** Consider abuse protection for a public submission endpoint. Whether rate limiting, CAPTCHA, or other controls are required and their thresholds are **Needs Confirmation**; do not assert one is required by the story.
- **Logging:** Log the required database failure with only approved diagnostic context. Whether submitted fields may be logged is not defined; default design recommendation is to avoid logging raw submitted content until explicitly reviewed.
- **Abuse protection:** Consider automated submissions, spam, replay, and resource exhaustion in a threat review. Required mitigations and product impact are **Needs Confirmation**.
- **Data protection:** Review transport, storage, access, retention, deletion, and backup controls against the project’s security/privacy standards. Story-specific controls and acceptance criteria are **Needs Confirmation**.

## 9. Testing Design

Test design only; no tests are claimed to have been written or run for this story.

### Unit Testing

- Validation behavior for required and optional fields once rules are confirmed.
- Mapping of validation/storage outcomes to safe API responses.
- Lead creation/persistence coordination without assuming a concrete module boundary.
- Logging redaction/metadata behavior once logging requirements are confirmed.

### API Testing

- Valid request reaches persistence and returns the agreed success response.
- Missing required fields are rejected.
- Invalid values are rejected according to confirmed rules.
- Database failure returns a safe error and triggers required logging.
- Malformed input and unexpected server errors follow the agreed contract.

### Integration Testing

- API validation and persistence against the chosen database integration.
- Database failure behavior using an agreed controlled test seam.
- Frontend/API contract and returned result handling.
- Analytics integration only if it is confirmed as in scope and its contract is defined.

### End-to-End Testing

- Visitor enters required data, optionally supplies phone/company, submits, and sees confirmation after successful persistence.
- Missing/invalid values are rejected and the visitor receives agreed feedback.
- Failure path displays a safe error and does not falsely confirm success.

### Security Testing

- Malformed and invalid inputs are rejected under confirmed constraints.
- Database/server errors do not expose internal details in visitor responses.
- Logs do not contain prohibited secrets or raw sensitive content, according to confirmed policy.
- Abuse controls, authentication, authorization, and rate-limit cases are tested only after the corresponding decisions are confirmed.

| Scenario                  | Expected Result                                                                                               | Test Level  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------- |
| Valid lead                | Lead successfully created and success response returned.                                                      | E2E / API   |
| Missing name              | Request rejected according to confirmed validation contract.                                                  | API         |
| Missing email             | Request rejected according to confirmed validation contract.                                                  | API         |
| Invalid email             | Request rejected according to confirmed validation rules; exact invalid cases **Needs Confirmation**.         | API         |
| Missing message           | Request rejected according to confirmed validation contract.                                                  | API         |
| Database failure          | Safe error returned; no success is claimed; required technical failure is logged.                             | Integration |
| Successful submission     | Confirmation displayed after successful API result.                                                           | E2E         |
| Unexpected server failure | Internal details are not exposed; required investigation logging occurs if classified as a technical failure. | API / E2E   |

The expected behavior for failure types and error copy must be confirmed where the story does not specify it.

## 10. Deployment and Operations Design

This section maps the proposal to the existing Build Me lifecycle. It does not claim that any step has been performed.

- **Build validation:** Include relevant frontend/API type checks and builds, plus database migration validation if a schema change is confirmed. Exact CI gates for this story are **Needs Confirmation**.
- **Automated testing:** Require agreed unit, API, integration, end-to-end, and security checks before release. Exact commands, required suites, and pass criteria are **Needs Confirmation**.
- **Environment configuration:** Identify API and database settings, secrets, environment owners, and required values per environment. Names, secret-management mechanism, environment topology, and ownership are **Needs Confirmation**; do not place secret values in this design.
- **CI/CD:** Fit the existing CI quality gate and deployment workflow. Which environment and workflow own the feature, and whether approvals/feature flags are required, are **Needs Confirmation**.
- **Deployment:** Deploy only after a separately approved design and implementation. API/UI/schema release order and migration compatibility are **Needs Confirmation**.
- **Health checks:** Validate existing service health and the lead-submission behavior after deployment. Endpoint and functional smoke-check procedure for this story are **Needs Confirmation**.
- **Monitoring:** Agree observable success/failure and latency signals, dashboards, thresholds, alert routing, owner, and observation period. All are **Needs Confirmation**.
- **Logging:** Ensure database failures can be investigated while external responses remain safe. Log schema, redaction, access, destination, and retention are **Needs Confirmation**.
- **Failure investigation:** Define correlation from a visitor submission through API and persistence without exposing private data. Correlation mechanism and runbook are **Needs Confirmation**.
- **Recovery/rollback:** Establish how to recover from unavailable persistence or a faulty release, including schema compatibility if applicable. Recovery objectives and rollback procedure are **Needs Confirmation**.
- **Post-deployment validation:** Confirm valid submission, persistence, success response, and visitor confirmation in the target environment; observe agreed metrics and errors. Target, test data, owner, and duration are **Needs Confirmation**.

## 11. Design Decisions

This is a proposed Design Decision Record. No human approval is implied.

| Decision                                                                                                                                           | Reason                                                                                                                                               | Alternatives                                                                                                                            | Status                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Keep the public UI, API boundary, persistence responsibility, and database as distinct logical responsibilities.                                   | The supplied flow explicitly moves from visitor form to API validation to database persistence, and the repository has web, API, and database areas. | Different internal module/service boundaries.                                                                                           | **Proposed — Requires Technology Owner Review** |
| Require server-side validation before persistence.                                                                                                 | The story explicitly says the API validates submitted data.                                                                                          | Client-only validation is not sufficient to satisfy the stated API validation requirement. Exact shared/client validation remains open. | **Proposed — Requires Technology Owner Review** |
| Do not return raw database/internal diagnostics to the visitor; record the specified technical failure for investigation.                          | This is explicitly required by the story.                                                                                                            | External error details and internal diagnostic format still require a contract and security review.                                     | **Proposed — Requires Technology Owner Review** |
| Treat analytics, CRM, notifications, authentication, authorization, rate limiting, endpoint name, schema name, and exact field rules as undecided. | These are not defined by the supplied story.                                                                                                         | Product/Technology owners decide scope and contracts before implementation.                                                             | **Needs Confirmation**                          |
| Use a separate lead service as a deployable service.                                                                                               | No evidence supports this deployment boundary.                                                                                                       | Keep persistence coordination within the existing API application or another reviewed boundary.                                         | **Needs Confirmation — no choice made**         |

## 12. Design Risks

| Risk                            | Impact                                                                                  | Mitigation                                                                                                | Status                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Unclear API contract            | Frontend and API may disagree on request, success, and error behavior.                  | Agree and review a versioned contract before BUILD; do not invent a route or schema.                      | **Needs Confirmation**                                                   |
| Unclear database schema         | Persistence may omit required data or create incompatible migrations.                   | Confirm fields, types, ID, timestamp, retention, and migration strategy before implementation.            | **Needs Confirmation**                                                   |
| Validation ambiguity            | Different layers may accept/reject different values; user feedback may be inconsistent. | Product and Technology owners define field rules and error mapping before tests and implementation.       | **Needs Confirmation**                                                   |
| Security risks                  | Contact/enquiry data or internal diagnostics may be exposed or abused.                  | Complete privacy/threat review; agree API validation, safe errors, log redaction, and any abuse controls. | **Needs Confirmation**                                                   |
| Data persistence failure        | Visitor may receive false success or the lead may be unavailable for follow-up.         | Do not return success before confirmed persistence; define logging and recovery behavior.                 | Supported high-level handling; detailed recovery **Needs Confirmation**. |
| Frontend/API mismatch           | Submission or result handling may fail despite each part appearing locally correct.     | Contract-first review and integration/E2E verification.                                                   | **Needs Confirmation**                                                   |
| Deployment configuration issues | API may not connect to the intended database or environment.                            | Validate configuration/secrets and environment ownership before deployment; no values in source.          | **Needs Confirmation**                                                   |
| Monitoring gaps                 | Failures after release may not be detected or investigated promptly.                    | Define logs, metrics, alerts, owner, and observation period before release.                               | **Needs Confirmation**                                                   |

## 13. AI Design Review

| Review Question                                      | Finding                                                                                                                                                                                                      | Action                                                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Does the design satisfy every technical requirement? | It covers collection, API submission/validation, persistence, success, visitor confirmation, rejection, safe database errors, and investigation logging at a logical level. Detail contracts remain unknown. | Review the contract and acceptance criteria with Product and Technology owners before BUILD.                      |
| Is any requirement missing?                          | The stated flow names Analytics and Admin Dashboard, but behavior for these stages is not defined.                                                                                                           | Confirm whether either is part of this Child Story or a separate story.                                           |
| Is any assumption being treated as a fact?           | No endpoint, table, technology choice, validation formula, analytics event, or identity policy has been selected. Logical responsibility boundaries are proposals.                                           | Technology Owner reviews proposed boundaries; Product/other owners resolve scope decisions.                       |
| Are component responsibilities clear?                | The logical UI/API/validation/persistence/database/error/logging responsibilities are described. The lead-service deployment boundary is not established.                                                    | Confirm module/service boundaries during technical review; do not introduce a new service by assumption.          |
| Is the data flow complete?                           | The known happy path and specified validation/database failure paths are represented. Network, unexpected API, duplicate-submit, and analytics failures are not fully defined.                               | Confirm failure matrix, retry/idempotency, and analytics behavior.                                                |
| Are API responsibilities clear?                      | API acceptance, validation, persistence coordination, success response, safe failure handling, and logging responsibilities are identified. Contract details are unknown.                                    | Approve endpoint and request/response/error contract before implementation.                                       |
| Are security concerns covered?                       | Known safe-error requirement is covered; submitted data, anonymous access, abuse protection, privacy, and log redaction need decisions.                                                                      | Perform security/privacy review and record decisions.                                                             |
| Can the solution be tested?                          | The story supports happy-path, required-field, persistence-failure, safe-error, logging, and UI-state scenarios. Exact cases and criteria are incomplete.                                                    | Define acceptance criteria and detailed validation/error expectations before implementing tests.                  |
| Can it be deployed and operated?                     | The existing lifecycle has build, CI, deployment, health validation, and monitoring stages; story-specific configuration and operational signals are unknown.                                                | Confirm environments, release sequence, recovery/rollback, signals, owners, and observation window.               |
| Are failures handled?                                | Missing/invalid input and database failure are specified. Other API/network failures are not.                                                                                                                | Product/Technology owners define expected visitor behavior and technical response for additional failure classes. |
| Are unknowns clearly identified?                     | Yes; see Needs Confirmation labels in the design and No-Guessing Check.                                                                                                                                      | Resolve or explicitly defer each unknown with an owner before BUILD.                                              |
| Is anything being built before it is designed?       | No implementation is included in this artifact.                                                                                                                                                              | Keep BUILD blocked until Technology Owner reviews/approves design and Product-owned requirements are confirmed.   |

## 14. Technology Owner Review

### AI Proposed

AI proposes the logical flow Visitor → Lead Capture UI → API → Validation → Lead service/application responsibility → Database, with separate safe-error and logging paths, and analytics/monitoring only when their scope and contracts are confirmed. AI also proposes contract-first review, validation before persistence, and tests for known success and failure behavior.

### Technology Owner Review

**Technology Owner review required; not performed by this document.** The Technology Owner should accept, reject, modify, or confirm the responsibility boundaries, API/data contracts, security controls, observability, test plan, deployment fit, and recovery design. Product Ownership must decide product behavior and acceptance criteria. Relevant data/security/analytics owners must review their areas.

### Final Design

**Proposed — Requires Technology Owner Review.** No final approved design is claimed. Until review, use only the logical architecture and confirmed behaviors in this document as a discussion baseline. Exact endpoint, schema, validation, analytics, identity, CRM, notification, operational, and deployment decisions remain **Needs Confirmation**.

### Reason

This is a planning exercise, not an approval record. Marking the design as final would misrepresent that a human Technology Owner made a decision and that Product-owned unknowns were resolved.

## 15. Design Gate

- [x] Requirements understood from the supplied Child Story; product acceptance detail still needs confirmation.
- [x] Technical requirements understood at a high level.
- [x] AI design analysis completed as a proposal.
- [x] High-level architecture defined as a logical proposal.
- [x] Components identified.
- [x] Data flow defined, including known failure points.
- [x] API design considered; contract details **Needs Confirmation**.
- [x] Data design considered; physical schema **Needs Confirmation**.
- [x] Security considered; unresolved controls marked **Needs Confirmation**.
- [x] Testing design completed as a plan; no tests were run for this exercise.
- [x] Deployment considered; no deployment was performed.
- [x] Operations considered.
- [x] Risks identified.
- [x] Unknowns identified.
- [x] AI design review completed.
- [ ] Technology Owner review required; approval has not been given.
- [ ] Ready for BUILD only after design approval and resolution/ownership of required unknowns.

## 16. Final Design Evidence

### Child Story

Submit a Lead Through the Public Website

### Planning Evidence

```text
Requirement
    ↓
AI Understanding
    ↓
Technical Requirements
    ↓
Technical Tasks
```

The planning record is [lead-capture-child-story-planning-test.md](lead-capture-child-story-planning-test.md). It is input to this proposal, not evidence of implementation or Product acceptance.

### Design Evidence

```text
Technical Requirements
    ↓
AI Design Analysis
    ↓
Architecture
    ↓
Data/API Design
    ↓
Security Design
    ↓
Testing Design
    ↓
Deployment/Operations Design
    ↓
AI Design Review
    ↓
Technology Owner Review
    ↓
BUILD READY only after approval
```

### Implementation Status

Not built.

### Deployment Status

Not deployed.

### Design Status

Design exercise drafted as proposed. Unresolved items are marked **Needs Confirmation**. Technology Owner review and approval are still required; this document does not claim approval or readiness for BUILD.

## 17. Evidence of AI Supporting Design

This exercise shows AI being used before coding to analyze the requirements, map the existing architecture, identify components and responsibilities, trace data flow and failure points, outline API/data boundaries, consider security, design testing, consider deployment and operations, identify technical risks, challenge assumptions, and mark unknowns. AI produced a reviewable design proposal rather than implementation code. The Technology Owner remains responsible for reviewing and approving the technical design; Product Ownership remains responsible for product requirements, outcomes, UX, business needs, and product acceptance.
