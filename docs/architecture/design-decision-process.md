# Design Decision Process

## Purpose

The Design Decision Process ensures that Technology checks the existing Build Me architecture before creating new technical architecture.

The goal is to reuse existing foundations wherever they can satisfy the requirement.

The core rule is:

> **Reuse first. Create new architecture only when necessary.**

---

## Design Decision Flow

Requirement
↓
Existing Architecture Check
↓
Reuse Existing Foundation
↓
Design Only What Is New
↓
Review Design
↓
Approve

---

## Step 1 — Requirement

Start with the approved Child Story.

Identify:

- User outcome
- Product requirement
- Technical requirements
- Scope
- Out of scope

Do not change or invent product requirements.

---

## Step 2 — Existing Architecture Check

Before designing anything new, check the existing Build Me foundation.

Review:

- Frontend
- Backend
- API
- Database
- Shared UI
- Analytics
- Security
- Testing
- Deployment
- Monitoring
- Operations

Record what already exists and where it exists.

If something cannot be verified, record:

**Needs Confirmation**

---

## Step 3 — Reuse Existing Foundation

For each requirement, determine whether an existing Build Me component, service, pattern, or infrastructure can satisfy it.

Ask:

> Can the existing foundation handle this requirement?

If yes:

**Reuse it.**

If it can be extended:

**Modify/reuse it.**

Do not create a new architecture when the existing foundation can reasonably support the requirement.

---

## Step 4 — Design Only What Is New

Only after checking existing architecture should new design be considered.

New architecture is justified only when:

- The existing foundation cannot satisfy the requirement.
- An existing component cannot reasonably be extended.
- A new capability is genuinely required.
- The new design is supported by a documented technical requirement.

If this cannot be established:

**Needs Confirmation**

---

## Step 5 — Review Design

Review the proposed design against:

- Requirement coverage
- Architecture reuse
- Simplicity
- Consistency
- Security
- Testing
- Deployment
- Operations
- Risks
- Dependencies
- Unknowns

The review must identify unnecessary new architecture.

---

## Step 6 — Approve

The Technology Owner reviews the design.

Approval confirms that:

- The requirement is understood.
- Existing architecture was checked.
- Reusable components were identified.
- New architecture is justified where required.
- Risks are understood.
- Unknowns are identified.
- The design is ready for implementation.

Approval must not be claimed until actual Technology Owner approval is given.

---

## Design Decision Principle

The default decision is:

**Reuse Existing Foundation**

not:

**Create New Architecture**

New architecture requires a clear technical reason.

---

## Design Decision Record

| Decision   | Existing Foundation   | New Design    | Reason             | Status                                 |
| ---------- | --------------------- | ------------- | ------------------ | -------------------------------------- |
| [Decision] | [Existing capability] | [If required] | [Technical reason] | [Proposed/Approved/Needs Confirmation] |

---

## Unknowns

| Unknown   | Why It Matters | Owner                | Status |
| --------- | -------------- | -------------------- | ------ |
| [Unknown] | [Impact]       | [Product/Technology] | Open   |

---

## Process Test — TODO 7B

**Status: BLOCKED — a verified Child Story from the Product Epic is unavailable.**

The required test input is one original Child Story from the existing Build Me Product Epic Story. A search of the current repository found no Product Epic or original Child Story source. The title “Submit a Lead Through the Public Website” appears in the [lead-capture planning artifact](lead-capture-child-story-planning-test.md) and [design artifact](design-foundation-lead-capture.md), but those are derived documents and do not provide the original Product Epic requirement. A GitHub issue search was attempted but could not run because this session is not authenticated.

The process therefore stops at **Requirement**. No story-specific architecture reuse decision, new-architecture proposal, design review, or approval can be made without inventing or assuming requirements. This is a blocked-input check, not a completed end-to-end test using a real Child Story.

**To complete the test:** provide and verify the original Product Epic and Child Story, then run the documented flow from Requirement through Approval. Until then, no approval or readiness for Build is claimed.

---

## Design Status

**Status:** Draft

**Technology Owner Approval:** Pending

**Ready for Build:** No
