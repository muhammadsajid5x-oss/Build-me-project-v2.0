# Technical Design Template

## Child Story

**Story:**
[Enter the Child Story]

**Parent Epic:**
[Enter the Parent Epic]

---

## User Outcome

### What should the user be able to achieve?

[Describe the expected user outcome.]

### Success Condition

[Describe what must be true for the user outcome to be achieved.]

---

## Frontend Changes

### Existing Changes

[List existing frontend components/pages that need to change.]

### New Changes

[List new frontend work required.]

### User Interaction

[Describe the expected user interaction and states.]

---

## Backend Changes

### Existing Changes

[List existing backend services/controllers/modules that need to change.]

### New Changes

[List new backend services/controllers/modules required.]

### Business/Technical Logic

[Describe the backend logic required.]

---

## API Changes

### Existing API

[List existing API endpoints that will change.]

### New API

[List new API endpoints required.]

### Request

[Define request structure or link to API contract.]

### Response

[Define response structure or link to API contract.]

### Validation

[Define request validation requirements.]

### Error Handling

[Define expected API error behaviour.]

---

## Database Changes

### Existing Data

[List existing tables/entities that will change.]

### New Data

[List new tables/entities required.]

### Fields

| Field   | Required | Purpose   | Validation |
| ------- | -------- | --------- | ---------- |
| [Field] | [Yes/No] | [Purpose] | [Rules]    |

### Relationships

[Describe relationships between data entities.]

### Migration Required?

[Yes / No / Needs Confirmation]

---

## Shared Components

[List shared components, packages, services, utilities, types, or configurations required.]

---

## Existing Components Reused

[List existing components or services that can be reused.]

For each component explain:

| Component   | Where Used | How Reused |
| ----------- | ---------- | ---------- |
| [Component] | [Location] | [Usage]    |

---

## New Components Required

[List components that do not currently exist and need to be created.]

For each component explain:

| Component   | Responsibility   | Location   |
| ----------- | ---------------- | ---------- |
| [Component] | [Responsibility] | [Location] |

---

## Analytics

### Events

[List analytics events required.]

### Data

[Describe what should be measured.]

### Success Metric

[Define the relevant success measurement.]

If analytics requirements are not defined:

**Needs Confirmation**

---

## Security

For every check, describe the existing foundation, required changes, and verification. Mark an item **Not applicable** with a reason or **Needs Confirmation**; do not leave it blank.

### Authentication

[How is identity established and verified? Which actions require authentication?]

### Authorisation

[Which roles or permissions may perform each operation or access each resource? Where are checks enforced?]

### Input Validation

[Describe schemas, bounds, normalization, and rejection behavior for all untrusted input.]

### Data Protection

[Identify sensitive data, minimization, access, encryption, retention, and logging-redaction requirements.]

### Secrets

[List required secret names and their secure source, access scope, and rotation expectations. Never record secret values.]

### API Security

[Describe endpoint authentication/authorization, safe error responses, transport/CORS, security headers, and rate limits where applicable.]

### Abuse Risks

[Assess enumeration, automation, replay, resource exhaustion, and other relevant abuse cases and mitigations.]

### Error Handling

[Describe safe external errors and protected diagnostic logging.]

Unknown or unresolved security requirements:

**Needs Confirmation**

---

## Performance

### Performance Requirements

[Define known performance requirements.]

### Expected Load

[Define known traffic/load requirements.]

### Performance Risks

[Identify potential performance risks.]

### Performance Validation

[Describe how performance will be validated.]

If no specific requirement exists:

**Needs Confirmation**

---

## Deployment

### Build Requirements

[List build requirements.]

### Environment Variables

[List required configuration.]

### CI/CD

[Describe required pipeline changes.]

### Deployment Dependencies

[List deployment dependencies.]

### Post-Deployment Validation

[Describe checks required after deployment.]

---

## Monitoring

### Logs

[List important events/errors that must be logged.]

### Metrics

[List important metrics.]

### Health Checks

[List required health checks.]

### Alerts

[List conditions that should trigger investigation/alerting.]

---

## Recovery

### Failure Scenarios

[List important failure scenarios.]

### Recovery Approach

[Describe how the system should recover.]

### Rollback

[Describe rollback requirements.]

### Data Recovery

[Describe data recovery requirements.]

---

## Risks

| Risk   | Impact   | Mitigation   | Status          |
| ------ | -------- | ------------ | --------------- |
| [Risk] | [Impact] | [Mitigation] | [Open/Resolved] |

---

## Dependencies

| Dependency   | Type                | Required For | Status                     |
| ------------ | ------------------- | ------------ | -------------------------- |
| [Dependency] | [Internal/External] | [Purpose]    | [Known/Needs Confirmation] |

---

## Design Decisions

| Decision   | Reason   | Alternatives   | Status                                 |
| ---------- | -------- | -------------- | -------------------------------------- |
| [Decision] | [Reason] | [Alternatives] | [Proposed/Approved/Needs Confirmation] |

---

## Unknowns / Needs Confirmation

| Unknown   | Why It Matters | Owner                | Status |
| --------- | -------------- | -------------------- | ------ |
| [Unknown] | [Impact]       | [Product/Technology] | [Open] |

---

## Design Review

### Requirements Covered

- [ ] User outcome covered
- [ ] Frontend changes covered
- [ ] Backend changes covered
- [ ] API changes covered
- [ ] Database changes covered
- [ ] Shared components considered
- [ ] Existing components considered
- [ ] New components identified
- [ ] Analytics considered
- [ ] Authentication, authorisation, input validation, data protection, secrets, API security, and abuse risks addressed or explicitly marked Not applicable/Needs Confirmation
- [ ] Performance considered
- [ ] Deployment considered
- [ ] Monitoring considered
- [ ] Recovery considered
- [ ] Risks identified
- [ ] Dependencies identified
- [ ] Unknowns identified

### AI Design Support

AI was used to support:

- Requirements analysis
- Architecture exploration
- Component identification
- Data/API design
- Security analysis
- Performance considerations
- Testing considerations
- Deployment/operations considerations
- Risk identification

AI suggestions must be reviewed by the Technology Owner before implementation.

---

## Design Status

**Status:** [Draft / In Review / Approved for Build / Needs Confirmation]

**Technology Owner Review:** [Pending / Complete]

**Product Requirements Confirmed:** [Yes / No / Needs Confirmation]

**Ready for Build:** [Yes / No]
