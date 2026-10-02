# Design Prompt

## Purpose

Use this prompt to help Technology create a technical design from an approved Child Story before implementation.

## Prompt

> Using the approved Child Story requirement, create a simple technical design for the Build Me project.
>
> Use the existing Build Me architecture, components, services, standards, and technical foundations wherever they already support the requirement.
>
> Do not invent new architecture, services, technologies, or patterns if the existing foundation can handle the requirement.
>
> Analyse and identify the required changes for:
>
> - Frontend
> - Backend
> - API
> - Database
> - Shared components
> - Existing components that can be reused
> - New components required
> - Analytics
> - Security, explicitly covering:
>   - Authentication: how identity is established and verified.
>   - Authorisation: which roles may perform operations and access resources.
>   - Input validation: schemas, bounds, normalization, and rejection behavior.
>   - Data protection: sensitive data, minimization, access, retention, and redaction.
>   - Secrets: required secret names, secure storage, access, and rotation; never include secret values.
>   - API security: authentication enforcement, safe errors, transport/CORS, security headers, and rate limiting where applicable.
>   - Abuse risks: enumeration, automation, replay, resource exhaustion, and relevant mitigations.
> - Performance
> - Testing
> - Deployment
> - Monitoring
> - Recovery
> - Risks
> - Dependencies
>
> For each area:
>
> 1. Identify what already exists and can be reused.
> 2. Identify what needs to change.
> 3. Identify anything genuinely new that is required.
> 4. Explain why the change is required.
>
> Clearly separate:
>
> - Known requirements
> - Existing Build Me capabilities
> - Proposed design decisions
> - Needs Confirmation
>
> Do not guess missing product requirements.
>
> Do not make product decisions.
>
> For each security area, describe the existing foundation, required changes, and verification. If an area is not applicable, explain why. If a decision or information is missing, write **Needs Confirmation** and identify what must be confirmed.
>
> Do not write production code.
>
> Do not claim anything has been built, tested, or deployed.
>
> If information is missing, write **Needs Confirmation** instead of inventing an answer.
>
> Keep the design simple, practical, and aligned with the existing Build Me foundation.
>
> The final design should provide a clear technical starting point for the BUILD stage.
>
> Technology Owner remains responsible for reviewing and approving the technical design before implementation.
