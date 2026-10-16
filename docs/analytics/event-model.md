# Analytics Event Model

## Purpose

Define a consistent, privacy-conscious shape for analytics events. A feature should emit events only when its approved requirements call for measurement.

## Event Fields

| Field         | Meaning                                                                           | Rules                                                                                                                                                                                                                                                                          |
| ------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Event Name    | Stable identifier for what happened.                                              | Use lowercase dot-separated names, such as `dashboard.project.opened`. Do not rename an event without considering existing reports and consumers.                                                                                                                              |
| Event Type    | Broad interaction category.                                                       | Use the database enum values `view` or `click`; the API validates the type against the allowlisted event name.                                                                                                                                                                 |
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
page.viewed       (type: view)
navbar.home.clicked (type: click)
journey.started
journey.completed
journey.abandoned
```

## Current Database Mapping

The `analytics_events` table has `name`, `event_type`, nullable `user_id`, `timestamp`, and JSONB `properties` columns. `event_type` is a PostgreSQL enum with `view` and `click` values; existing rows default to `click` in migration `0002_fast_morg`.

- Event Name maps to `name`.
- Event Type maps to `event_type`.
- User maps to `user_id`.
- Timestamp maps to `timestamp`.
- Feature, Session, and Relevant Data map to keys in `properties` (`feature`, `session_id`, and `data`).

Example logical event:

```json
{
  "name": "page.viewed",
  "event_type": "view",
  "user_id": null,
  "timestamp": "2026-10-01T12:00:00Z",
  "properties": {
    "feature": "page",
    "data": {
      "path": "/"
    }
  }
}
```

The example is illustrative only; it does not define a requirement to track project views. Add event names and data fields only when a product requirement and privacy review justify them.

## Current Pipeline Status

The Python analytics pipeline validates `view` and `click` types, then reports counts by event name and event type. Its tracker stores events in memory for the lifetime of the process.

The Web app emits an allowlisted `page.viewed` event for each router location and `navbar.home.clicked` when the Home logo is clicked. Both are anonymous and sent through `POST /api/v1/analytics/events`; the API verifies the event name/type pair, constructs the stored properties, and limits the endpoint to 30 requests per 15 minutes.

Durable storage requires `DATABASE_URL` and migration `0002_fast_morg` to be applied. Local tests verify ingestion with a mocked database; they do not verify a deployed database, production ingestion, dashboards, or retention.

To observe collection after deployment, compare the event count over a fixed window with Navbar usage and inspect API error logs for persistence failures:

```sql
SELECT event_type, count(*) AS events
FROM analytics_events
WHERE timestamp >= now() - interval '24 hours'
GROUP BY event_type;
```

If collection fails, Home navigation remains available. Check the API deployment, `DATABASE_URL`, and migration state, then restore the last healthy API deployment or apply a reviewed forward fix. Do not replay events or restore analytics data without an approved recovery procedure.
