# API Design

> Complete after the API contract is reviewed. This document maps the approved contract to the existing Build Me architecture; it does not replace or silently change the contract.

## 1. References and Status

- **Child Story:** [ID and title]
- **Approved API contract:** [Path and version]
- **Design owner:** [Name/role]
- **Status:** [Draft / In Review / Approved / Needs Confirmation]
- **Related migration/design records:** [Links or None]

## 2. Contract Summary

- **Method and path:** [As contracted]
- **Consumer(s):** [As contracted]
- **Success behavior:** [As contracted]
- **Error behavior:** [As contracted]

## 3. Existing Architecture Check

Record the existing capability and intended reuse. Write **Not required** or **Needs Confirmation** where appropriate.

| Area                         | Existing Build Me foundation | Reuse or change required      |
| ---------------------------- | ---------------------------- | ----------------------------- |
| API route/controller         | [Path/module]                | [Plan]                        |
| Authentication/authorization | [Middleware/policy]          | [Plan]                        |
| Validation/error handling    | [Validator/handler]          | [Plan]                        |
| Service/business logic       | [Service/module]             | [Plan]                        |
| Database/data access         | [Schema/repository]          | [Plan; migration if required] |
| Shared types                 | [Package/type]               | [Plan]                        |
| Analytics/logging            | [Existing capability]        | [Plan or Not required]        |
| Tests/configuration          | [Existing tests/config]      | [Plan]                        |

New architecture or capability must be justified by a contract requirement that the existing foundation cannot meet.

## 4. Request Flow

```text
Consumer
	→ Route
	→ Authentication/authorization (if contracted)
	→ Request validation
	→ Service/business logic
	→ Data access/integration (if contracted)
	→ Contracted response/error
```

Replace or annotate each step to match the actual contract and repository. Do not retain irrelevant steps as requirements.

## 5. Component Responsibilities

| Component/module | Responsibility   | Existing or new         | Contract behavior covered    |
| ---------------- | ---------------- | ----------------------- | ---------------------------- |
| [Module]         | [Responsibility] | [Existing/Modified/New] | [Method/path/response/error] |

## 6. Data and Error Design

- **Data source/schema:** [Existing schema or design reference]
- **Data changes/migration:** [Required / Not required with reason / Needs Confirmation]
- **Transaction/consistency behavior:** [As required]
- **Error mapping:** [Internal failure to contracted response]
- **Logging/redaction:** [Diagnostic plan without exposing sensitive data]

## 7. Security and Operations

- **Authentication/authorization enforcement:** [Where and how]
- **Input validation and abuse controls:** [Design]
- **Secrets and environment configuration:** [Names/ownership; never record values]
- **Monitoring/logging:** [Signals needed to investigate contracted outcomes]
- **Recovery/rollback:** [Relevant actions]

## 8. Verification and Integration Plan

| Contract requirement | Automated test           | Integration check               | Evidence/location |
| -------------------- | ------------------------ | ------------------------------- | ----------------- |
| [Requirement]        | [Unit/API/contract test] | [Consumer or environment check] | [Path/result]     |

Include success, validation, error, authorization, and edge-case coverage where required by the contract.

## 9. Decisions, Risks, and Unknowns

| Item   | Decision/risk/unknown | Owner   | Status                             |
| ------ | --------------------- | ------- | ---------------------------------- |
| [Item] | [Details]             | [Owner] | [Open/Resolved/Needs Confirmation] |

## 10. Design Review Gate

- [ ] Every contract behavior maps to a component and validation plan.
- [ ] Existing Build Me architecture was checked and reused where suitable.
- [ ] Any new capability is justified by an approved requirement.
- [ ] Security, data, errors, migration, observability, and recovery are addressed.
- [ ] Unknowns are resolved or assigned before implementation.
- [ ] API owner and relevant consumer owner reviewed the design.

- **Reviewers and outcome:** [Names, date, decision]
- **Approval to implement:** [Pending / Approved / Needs Confirmation]
