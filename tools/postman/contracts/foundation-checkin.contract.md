# API Contract: Foundation Check-in

## 1. Source Requirement

- **Child Story:** Foundation Check-in (dummy), see [readiness test](../../../docs/planning/foundation-child-story-readiness-test.md)
- **User outcome:** A person submits their name and receives confirmation that a check-in was recorded.
- **Acceptance criteria:** Valid name returns 201 with an ID and timestamp; invalid input returns 400 with a stable error code.
- **Contract owner:** Needs Confirmation
- **Status:** Draft

## 2. Operation

- **Operation name:** Create foundation check-in
- **Method:** POST
- **Path:** `/api/v1/foundation-checkins`
- **API version:** v1
- **Consumer(s):** Web app
- **Authentication:** Anonymous (dummy story)
- **Authorization:** Not required; no protected data

## 3. Request

### Headers

| Name                             | Required | Meaning         |
| -------------------------------- | -------- | --------------- |
| `Content-Type: application/json` | Yes      | Body format     |
| `Accept: application/json`       | No       | Response format |

### Request Body

| Field  | Type   | Required | Constraints                       | Meaning                        |
| ------ | ------ | -------- | --------------------------------- | ------------------------------ |
| `name` | string | Yes      | 1 to 80 characters after trimming | Name of the person checking in |

Unknown fields are ignored and not stored.

```json
{ "name": "Ada Lovelace" }
```

## 4. Responses

### Success

- **Status code:** `201 Created`
- **Body:** `{ "data": { "id": string, "name": string, "createdAt": ISO 8601 string } }`

```json
{
  "data": {
    "id": "b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
    "name": "Ada Lovelace",
    "createdAt": "2026-10-03T10:00:00.000Z"
  }
}
```

### Errors

| Condition                                                | Status | Code                         | User-safe detail                                                                                      |
| -------------------------------------------------------- | ------ | ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| Name missing, empty, not a string, or over 80 characters | 400    | `VALIDATION_ERROR`           | `details` lists the `name` field and a message                                                        |
| Body is not valid JSON                                   | 500    | `INTERNAL_SERVER_ERROR`      | Generic message only; the shared error handler does not yet map body-parser errors to 400 (known gap) |
| Rate limit exceeded                                      | 429    | Existing rate-limit response | Existing behaviour                                                                                    |
| Unexpected failure                                       | 500    | `INTERNAL_SERVER_ERROR`      | Generic message only                                                                                  |

Error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [{ "field": "name", "message": "Name is required." }]
  }
}
```

## 5. Behavior and Validation

- **Normalization:** `name` is trimmed.
- **Side effects:** One check-in is stored in memory. No database write.
- **Idempotency:** Not idempotent; each call creates a new check-in.

## 6. Security and Data Handling

- **Sensitive data:** Only a name is accepted; it is not logged.
- **Abuse/rate limiting:** Existing API rate limiter.
- **Privacy/retention:** In-memory only; lost on restart. Needs Confirmation for any real use.

## 7. Compatibility

- **Breaking change?:** No, new endpoint.

## 8. Contract Review

- [ ] Request and response match the story.
- [ ] Error and validation behaviour defined.
- [ ] Security reviewed.
- [ ] Consumer and API owner reviewed.
- **Approval:** Pending
