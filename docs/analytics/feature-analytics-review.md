# Product / Feature Analytics Review

Complete this review for every Child Story during planning, before implementation. The purpose is to decide what user behavior or outcome should be measured, not to instrument every interaction by default.

For each question, record **Track**, **Not applicable** with a reason, or **Needs Confirmation** with an owner. If tracking is approved, define its stable event name, trigger condition, minimal properties, and verification evidence.

## Child Story

- **Story:** [ID and title]
- **Feature / journey:** [Stable feature identifier]
- **Product owner / reviewer:** [Name or role]
- **Review date:** [YYYY-MM-DD]

## Review Questions

| Question               | Decision                                      | Event / outcome and trigger                                                                      | Minimal properties             | Verification    |
| ---------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------ | --------------- |
| Was it viewed?         | [Track / Not applicable / Needs Confirmation] | [Define what counts as a meaningful view]                                                        | [Allowlisted context, or none] | [Test/evidence] |
| Was it clicked?        | [Track / Not applicable / Needs Confirmation] | [Name only meaningful measured actions; do not track generic clicks]                             | [Allowlisted context, or none] | [Test/evidence] |
| Was it started?        | [Track / Not applicable / Needs Confirmation] | [Define the point the feature or journey actually begins]                                        | [Allowlisted context, or none] | [Test/evidence] |
| Was it completed?      | [Track / Not applicable / Needs Confirmation] | [Define the successful outcome that constitutes completion]                                      | [Allowlisted context, or none] | [Test/evidence] |
| Was it abandoned?      | [Track / Not applicable / Needs Confirmation] | [Define an explicit abandonment condition; do not infer it only from a missing completion event] | [Allowlisted context, or none] | [Test/evidence] |
| What outcome happened? | [Track / Not applicable / Needs Confirmation] | [Define the product or user outcome and how it is measured]                                      | [Allowlisted context, or none] | [Test/evidence] |

## Event Contract

For every approved event, specify:

- **Event name:** lowercase, dot-separated, stable, and named for a meaningful outcome (for example, `journey.started`).
- **User:** application user UUID when known, otherwise `null`; do not use email, credentials, or a Supabase Auth UUID until the identity mapping is approved.
- **Feature:** stable feature identifier.
- **Timestamp:** UTC; client time is not authoritative unless a requirement says otherwise.
- **Session:** opaque, short-lived identifier only; never a session token or JWT.
- **Relevant data:** minimal allowlisted properties needed for the approved measurement.

Do not include secrets, tokens, raw form contents, unnecessary personal data, or sensitive data. Follow the [Analytics Event Model](event-model.md) for event naming, privacy, and current storage mapping.

## Review Outcome

- **Success metric:** [What outcome indicates the feature is working?]
- **Events approved:** [Names, or None with reason]
- **Unresolved decisions / owner:** [Details, or None]
- **Product review:** [Reviewer, date, outcome]
- **Technical review:** [Reviewer, date, outcome]
