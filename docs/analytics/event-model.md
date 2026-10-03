# Analytics Event Model

## Purpose

Define a consistent, privacy-conscious shape for analytics events. A feature should emit events only when its approved requirements call for measurement.

## Event Fields

| Field         | Meaning                                                                           | Rules                                                                                                                                                                                                                                                                          |
| ------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Event Name    | Stable identifier for what happened.                                              | Use lowercase dot-separated names, such as `dashboard.project.opened`. Do not rename an event without considering existing reports and consumers.                                                                                                                              |
| User          | The application user associated with the event.                                   | Use the application user's UUID when known; use `null` for anonymous activity. Never store an email, access token, or other credential here. The current `users` table is not linked to Supabase Auth, so do not put a Supabase Auth UUID here until that mapping is designed. |
| Feature       | The product area that emitted the event.                                          | Use a stable, controlled identifier, such as `dashboard` or `lead_capture`; do not use arbitrary user input.                                                                                                                                                                   |
| Timestamp     | When the event occurred.                                                          | Use a timezone-aware timestamp in UTC. The database default is the persistence time; client-provided timestamps must not be treated as authoritative without a specific requirement.                                                                                           |
| Session       | An optional pseudonymous identifier grouping activity in one application session. | Use an opaque, short-lived identifier. Never store a Supabase session token, JWT, or persistent cross-session tracking ID here.                                                                                                                                                |
| Relevant Data | Minimal event-specific context needed for an approved measurement.                | Store an object with an allowlisted shape. Exclude secrets, credentials, raw form contents, and unnecessary personal or sensitive data.                                                                                                                                        |

## Event Name Rules

- Use lowercase, dot-separated names. The first segment identifies the feature or journey, optional middle segments scope a component or object, and the final segment names the action.
- Use stable identifiers and concise past-tense actions. Do not include user IDs, session IDs, timestamps, or other variable values in the event name; put approved context in `properties` instead.
- Name an event for a meaningful user or system outcome, not for an implementation detail.
- Emit `*.clicked` only for meaningful controls whose use is an approved measurement; do not record every generic click.
- Emit `*.started` when the feature or journey actually begins, `*.completed` only when its defined successful outcome occurs, and `*.abandoned` only when an explicit product rule identifies abandonment. Do not infer abandonment merely because a completion event is absent.
- Treat names as a stable analytics contract. If an event's meaning must change, introduce a new name and account for existing reports and consumers rather than silently reusing the old name.

Examples (illustrative; not a tracking requirement by themselves):

```text
navbar.viewed
navbar.clicked
journey.started
journey.completed
journey.abandoned
```

## Current Database Mapping

The existing `analytics_events` table has `name`, nullable `user_id`, `timestamp`, and JSONB `properties` columns. Until a schema change is approved:

- Event Name maps to `name`.
- User maps to `user_id`.
- Timestamp maps to `timestamp`.
- Feature, Session, and Relevant Data map to keys in `properties` (`feature`, `session_id`, and `data`).

Example logical event:

```json
{
  "name": "dashboard.project.opened",
  "user_id": null,
  "timestamp": "2026-10-01T12:00:00Z",
  "properties": {
    "feature": "dashboard",
    "session_id": "opaque-session-id",
    "data": {
      "project_id": "example-project-id"
    }
  }
}
```

The example is illustrative only; it does not define a requirement to track project views. Add event names and data fields only when a product requirement and privacy review justify them.

## Current Pipeline Status

The Python analytics foundation test sends `foundation.test.clicked` through `AnalyticsTracker`, `AnalyticsProcessor`, and `AnalyticsReporter`. The tracker's storage is in-memory for the lifetime of the process. There is not yet an ingestion or persistence path from this service to the `analytics_events` database table, so this test does not establish durable storage.
