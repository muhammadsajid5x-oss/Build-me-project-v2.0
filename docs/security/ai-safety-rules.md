# AI Safety Rules

## Purpose

AI must be used safely and responsibly throughout the Technology delivery lifecycle.

The Technology Owner remains responsible for protecting project, company, customer, and personal information when using AI tools.

## Non-Negotiable Rule

> Never provide secrets or unnecessary sensitive information to AI.

AI assistance must not compromise security, privacy, confidentiality, or production systems.

## Never Give AI

Do not provide AI with:

- Passwords
- API secrets
- API keys
- Access tokens
- Authentication tokens
- Private keys
- SSH private keys
- Production credentials
- Database passwords
- Cloud credentials
- Personal sensitive data
- Customer sensitive data
- Unnecessary confidential information

## Use Safe Alternatives

When AI needs example information, use:

### Fake Data

Use fictional values that do not represent real users, customers, credentials, or systems.

Example:

```text
{
  "name": "Example User",
  "email": "user@example.com"
}
```
### Example Data
Use deliberately created sample data for demonstrating behavior.
### Masked Data
Remove or hide sensitive portions before sharing information with AI.
### Sanitized Data
Remove unnecessary identifying or confidential information while keeping enough context to solve the technical problem.
## Key Principle
> Use fake, example, masked, and sanitized data instead of real secrets or unnecessary sensitive information.
