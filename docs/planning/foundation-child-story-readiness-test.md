# Foundation Readiness Test: Foundation Check-in

> Dummy Child Story used to prove a small story can move through the full delivery process. It stores no real customer data and has no product value. Status of each step is recorded in [Readiness Record](#readiness-record).

## Step 1: Plan

### Requirement

**Child Story:** Foundation Check-in (dummy).

A person on the Foundation Test Page can open a dialog, enter their name, and submit it. The system records a check-in and the page confirms it.

- The page shows a Card with a "Record check-in" button.
- The button opens a Modal with a required Name field (1 to 80 characters).
- Submitting sends the name to the API.
- On success the Modal shows a confirmation including the check-in ID.
- On invalid input or failure the Modal shows a safe error and stays open.

**Needs Confirmation:** there is no Product Owner for this dummy story; acceptance criteria above are assumptions made for the test.

### Technical Tasks

1. Document the API contract and Postman collection before implementation.
2. Write the SuperTest test first; confirm it fails.
3. Add request validation for the name.
4. Add a check-in service that creates a check-in with an ID and timestamp.
5. Add the `POST /api/v1/foundation-checkins` route and register it.
6. Add a web API call using the existing API client.
7. Add the Card and Modal flow to the Foundation Test Page, reusing `@build-me/ui` components.
8. Add component and end-to-end tests.
9. Record the analytics, security, performance, and deployment evidence.

### Risks

| Risk                                                                                          | Mitigation                                                                    |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| The API has no database wiring, so persistence cannot use the existing database structure yet | Use an in-memory service behind a small interface; record the gap             |
| The web app has no analytics client                                                           | Design the event only; do not implement; record the gap                       |
| Anonymous endpoint can be abused                                                              | Reuse the API rate limiter, validate and bound input, store no sensitive data |
| In-memory data is lost on restart and not shared across instances                             | Acceptable for a dummy story; never deploy it as real persistence             |
| Dummy endpoint reaches production                                                             | Needs Confirmation: decide whether to remove or disable it before release     |

### Dependencies

- Express API app and error handling in `services/api`.
- Validators in `services/api/src/validators`.
- `Card` and `Modal` from `packages/ui`.
- Foundation Test Page in `apps/web`.
- Jest and SuperTest test setup in `tests`.
- Postman collection folder in `tools/postman`.

## Step 2: Design

### Technical Design

```text
Foundation Test Page -> Modal form -> POST /api/v1/foundation-checkins
  -> validator -> check-in service (in-memory) -> 201 { data }
  -> Modal success state
```

User flow: open page, click "Record check-in", enter name, submit, see confirmation or a safe error.

### Component Design

| Component                        | Source                  | Use                                                                  |
| -------------------------------- | ----------------------- | -------------------------------------------------------------------- |
| `Card`, `CardHeader`, `CardBody` | `@build-me/ui` (reused) | Holds the check-in prompt                                            |
| `Modal`                          | `@build-me/ui` (reused) | Form dialog with `default`, `loading`, `error`, and `success` states |
| `Button`                         | `@build-me/ui` (reused) | Open and submit actions                                              |
| `FoundationCheckinCard`          | `apps/web` (new, small) | Composes the above and calls the API                                 |

No new shared component is needed.

### API Design

Contract: [foundation-checkin.contract.md](../../tools/postman/contracts/foundation-checkin.contract.md). `POST /api/v1/foundation-checkins`, anonymous, rate limited, returns `201` with `{ data: { id, name, createdAt } }`, and `400 VALIDATION_ERROR` for invalid input.

### Database Design

No schema change and no migration. The service stores check-ins in memory behind an interface so it can be replaced by a Drizzle repository later. **Needs Confirmation:** the table, if persistence is wanted.

### Analytics Design

Event `foundation_checkin_submitted` with no personal data (no name). It is designed only; the web app has no analytics client, so it is not emitted. See the [analytics event model](../analytics/event-model.md).

### Security Design

- Authentication: none (anonymous test endpoint). **Needs Confirmation** for any real use.
- Validation: `name` must be a string of 1 to 80 characters after trimming; unknown fields are ignored and not stored.
- Rate limiting: existing `apiRateLimiter`.
- Data protection: only a name is accepted; it is not logged.
- Errors: safe error shape; no internal detail.
- Output: the name is rendered as text by React, not as HTML.

### Test Design

| Level            | Test                                                                            | Proves                       |
| ---------------- | ------------------------------------------------------------------------------- | ---------------------------- |
| API (SuperTest)  | Valid name returns 201 with ID and timestamp                                    | The contract is honoured     |
| API (SuperTest)  | Missing, empty, over-long, and non-string names return 400 with the error shape | Validation works             |
| API (SuperTest)  | Response omits internal fields                                                  | No leakage                   |
| Unit (Jest)      | Validator and service                                                           | Logic in isolation           |
| Component (Jest) | Modal states and submit behaviour                                               | UI states                    |
| Storybook        | Existing Card and Modal stories                                                 | Reused components still work |
| E2E (Cypress)    | Open Modal, submit, see confirmation                                            | End-to-end flow              |
| pytest           | Existing analytics suite                                                        | Unaffected                   |
| k6 / ZAP         | Not needed for this dummy story                                                 | Not applicable               |

## Readiness Record

| #       | Step                     | Status  | Evidence                                                 |
| ------- | ------------------------ | ------- | -------------------------------------------------------- |
| 1       | Plan                     | Done    | This document                                            |
| 2       | Design                   | Done    | This document                                            |
| 3       | API contract and Postman | Done    | `tools/postman/contracts/`, `tools/postman/collections/` |
| 4       | Failing SuperTest        | Pending |                                                          |
| 5       | Build                    | Pending |                                                          |
| 6       | Test                     | Pending |                                                          |
| 7 to 21 | Push through Improve     | Pending | Need the repository owner, peer, and Product Owner       |
