# Child Story Technical Planning Template

> Copy this template for each child story that needs technical planning. Replace the guidance in brackets and remove sections that do not apply, recording why when useful.

## 1. Story Information

- **Epic / parent story:** [ID and title]
- **Child story:** [ID and title]
- **Owner:** [name or team]
- **Status:** [Draft / In review / Approved]
- **Last updated:** [YYYY-MM-DD]
- **Related documents:** [requirements, designs, API contracts, issues, or other plans]

## 2. Requirement and Outcome

### User story

> As a [user/persona], I want [capability] so that [value or outcome].

### Problem and desired outcome

[Describe the problem this child story solves and the observable outcome when it is complete.]

### Technical requirement questions — answer before implementation

- **What must the user be able to do?** [Describe the user capability and key interaction.]
- **What is the successful outcome?** [State the user-visible result and how success is measured.]
- **What data is needed?** [Identify inputs, outputs, ownership, sensitivity, retention, and source of truth.]
- **Does the feature need an API?** [Yes / No; identify contracts, endpoints, events, and consumers, or explain why none are needed.]
- **Does the feature need a database change?** [Yes / No; identify schema, migration, backfill, and compatibility needs, or explain why none are needed.]
- **Does the feature need analytics?** [Yes / No; identify events, properties, consent/privacy constraints, and success measures, or explain why none are needed.]
- **Does the feature need authentication?** [Yes / No; describe how the user's identity is established, or explain why it is not needed.]
- **Does the feature need authorization?** [Yes / No; describe roles, permissions, and resource-level access rules, or explain why it is not needed.]
- **What security risks exist?** [List threats, sensitive data, abuse cases, and mitigations.]
- **What performance needs exist?** [State latency, throughput, scale, and resource targets, or explain why there are no special targets.]
- **What must be tested?** [Map unit, integration, acceptance, security, analytics, and performance verification to the acceptance criteria.]
- **What must be deployed?** [List code, configuration, migrations, flags, dependencies, and rollout order.]
- **What must be observed after release?** [Identify logs, metrics, analytics, alerts, dashboards, owners, and observation period.]

Complete the [Product / Feature Analytics Review](../analytics/feature-analytics-review.md) for every Child Story, even when the outcome is that analytics are not applicable. Resolve or explicitly track unanswered questions before implementation. This planning pass must cover technical design, testing, delivery, and feature analytics.

### Acceptance criteria

- [ ] [Observable, verifiable criterion]
- [ ] [Observable, verifiable criterion]

## 3. Scope

### In scope

- [Behavior or deliverable included in this child story]

### Out of scope

- [Related work deliberately excluded; link follow-up stories where known]

### Assumptions and open questions

- **Assumptions:** [Assumptions that need validation]
- **Open questions:** [Question, owner, and resolution target]

## 4. Proposed Technical Approach

[Summarize the implementation approach and why it meets the requirements. Include alternatives considered when the choice has meaningful trade-offs.]

### Architecture and component impact

- **Applications / services / packages:** [Affected components]
- **Responsibilities and interactions:** [How components collaborate]
- **Architecture changes:** [None, or describe and link the decision record]

### Data and API impact

- **Data model / migrations:** [Changes, compatibility, backfill, or none]
- **API contracts / endpoints / events:** [Changes and links, or none]
- **External integrations:** [Systems, failure behavior, and none if not applicable]

### User interface impact

[Routes, screens, states, accessibility, responsive behavior, and design references, or none.]

## 5. Security, Privacy, and Reliability

- **Authentication and authorization:** [Requirements or none]
- **Input validation and abuse protection:** [Requirements or none]
- **Sensitive data / privacy:** [Data handled, retention, and exposure controls]
- **Failure modes and recovery:** [Expected failures, fallback, retry, or rollback behavior]
- **Observability:** [Logs, metrics, alerts, or tracing required]

## 6. Implementation Plan

Break the work into small, reviewable steps. Keep each step aligned with the acceptance criteria.

1. [Implementation step]
2. [Implementation step]
3. [Documentation, migration, or rollout step]

### Dependencies

- [Blocking or sequencing dependency, owner, and status; or none]

## 7. Verification Plan

| Level                   | What will be verified               | Test / evidence                  |
| ----------------------- | ----------------------------------- | -------------------------------- |
| Unit                    | [Logic and edge cases]              | [Test location or planned test]  |
| Component / integration | [Component or service interactions] | [Test location or planned test]  |
| End-to-end / acceptance | [User-visible acceptance criteria]  | [Test or manual procedure]       |
| Security / performance  | [Applicable risks and targets]      | [Test, scan, or N/A with reason] |

### Test data and environment

[Required fixtures, configuration, secrets, environment, or none. Do not put secret values in this document.]

## 8. Rollout and Completion

- **Feature flag / staged rollout:** [Plan or not applicable]
- **Migration and compatibility:** [Ordering, compatibility window, and cleanup]
- **Deployment and health validation:** [Deployment target and validation evidence]
- **Rollback plan:** [How to restore the known-good behavior]
- **Documentation updates:** [Documents to update]

## 9. Risks and Trade-offs

| Risk / trade-off | Impact                       | Mitigation / decision              |
| ---------------- | ---------------------------- | ---------------------------------- |
| [Risk]           | [Likelihood and consequence] | [Mitigation or accepted trade-off] |

## 10. Effort and Readiness

- **Estimated effort:** [Estimate and unit]
- **Confidence:** [Low / Medium / High, with rationale]
- **Ready to implement:** [Yes / No]
- **Readiness blockers:** [Unresolved decisions, dependencies, or missing acceptance criteria]

## 11. Review and Approval

- **Product / requirement review:** [Reviewer, date, outcome]
- **Technical review:** [Reviewer, date, outcome]
- **Security / data review:** [Reviewer or N/A with reason]
- **Approval notes:** [Decisions and follow-up actions]
