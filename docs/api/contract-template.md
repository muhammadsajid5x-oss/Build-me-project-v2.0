# API Contract

> Complete one contract per API operation or cohesive API surface. This is a planning artifact, not an implementation. Keep unknown details marked **UNKNOWN** or **NEEDS CONFIRMATION**; do not guess.

## 1. Source Requirement

- **Child Story:** [ID and title]
- **Parent Epic:** [ID and title, if available]
- **Requirement source:** [Link or repository location]
- **User outcome:** [Observable outcome from the approved story]
- **Acceptance criteria:** [Exact criteria or link]
- **Contract owner:** [Name/role]
- **Status:** [Draft / In Review / Approved / Needs Confirmation]

## 2. Operation

- **Operation name:** [Purpose]
- **Method:** [GET / POST / PUT / PATCH / DELETE]
- **Path:** [/api/v1/resource or UNKNOWN]
- **API version:** [Version]
- **Consumer(s):** [Web / Dashboard / external / UNKNOWN]
- **Authentication:** [Required / Anonymous / UNKNOWN]
- **Authorization:** [Rule / Not required with reason / UNKNOWN]

## 3. Request

### Headers

| Name     | Required | Meaning   | Source                    |
| -------- | -------- | --------- | ------------------------- |
| [Header] | [Yes/No] | [Purpose] | [Requirement or standard] |

### Path and Query Parameters

| Name        | Location     | Type   | Required | Constraints | Meaning   |
| ----------- | ------------ | ------ | -------- | ----------- | --------- |
| [Parameter] | [Path/Query] | [Type] | [Yes/No] | [Rules]     | [Purpose] |

### Request Body

| Field   | Type   | Required | Constraints/validation | Meaning/source          |
| ------- | ------ | -------- | ---------------------- | ----------------------- |
| [Field] | [Type] | [Yes/No] | [Rules]                | [Requirement reference] |

**Example request:**

```json
{}
```

## 4. Responses

### Success

- **Status code:** [Code and rationale]
- **Response body:** [Schema or no body]
- **Headers:** [Required response headers]

**Example response:**

```json
{}
```

### Errors

| Condition   | Status | Stable error code | Response shape | User-safe detail        |
| ----------- | ------ | ----------------- | -------------- | ----------------------- |
| [Condition] | [Code] | [Code]            | [Schema]       | [What may be disclosed] |

Do not expose stack traces, secrets, database details, or other internal diagnostics in public responses.

## 5. Behavior and Validation

- **Validation rules:** [Field and request rules]
- **Normalization:** [Required transformations or none]
- **Side effects:** [Persistence/events/other effects or none]
- **Idempotency/duplicate behavior:** [Requirement or UNKNOWN]
- **Pagination/filter/sort behavior:** [If relevant, otherwise Not applicable]
- **Timeout/retry behavior:** [If relevant, otherwise UNKNOWN]

## 6. Security and Data Handling

- **Authentication/authorization:** [Contracted behavior]
- **Sensitive data:** [Classification, minimization, and response handling]
- **Logging/redaction:** [What may be logged and what must not be logged]
- **Abuse/rate limiting:** [Requirement or NEEDS CONFIRMATION]
- **Privacy/retention:** [Requirement or NEEDS CONFIRMATION]

## 7. Compatibility

- **Breaking change?:** [Yes/No/UNKNOWN]
- **Versioning approach:** [How existing consumers remain compatible]
- **Deprecation/migration:** [If applicable]

## 8. Contract Review

- [ ] Request and response match the approved Child Story.
- [ ] Error and validation behavior is defined.
- [ ] Security and data handling are reviewed.
- [ ] Consumer and API owner reviewed the contract.
- [ ] Unknowns have owners; none are silently assumed.

- **Reviewers and outcome:** [Names, date, decision]
- **Approval:** [Pending / Approved / Needs Confirmation]
