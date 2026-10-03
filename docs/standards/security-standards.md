# Security Standards
## Purpose
These standards define the minimum security practices for building, reviewing, testing, and deploying Technology in the Build Me project.
The goal is to protect systems, applications, APIs, users, personal data, credentials, and other sensitive information.
## Security Principle
> Security is part of every Technology change, not a final step before release.
Technology Owners must consider security during development, review, testing, and deployment.
## 1. Secrets Management
Never commit secrets to Git.
Do not commit or expose:
- Passwords
- API keys
- Access tokens
- Authentication tokens
- Private keys
- SSH keys
- Database credentials
- Cloud credentials
- Production credentials
- Other confidential secrets
Use approved secure environment-variable or secret-management mechanisms.
If a secret is accidentally exposed:
1. Stop using the exposed secret.
2. Rotate or revoke it where applicable.
3. Remove it from the appropriate system.
4. Investigate the exposure.
5. Document the corrective action.
## 2. Input Validation
All externally supplied input must be treated as untrusted.
Validate input at appropriate system boundaries.
Check:
- Required fields
- Data types
- Allowed values
- Length limits
- Formats
- Numeric ranges
- Unexpected values
- Malicious or unsafe input
Do not rely only on client-side validation for security.
Server-side validation must be used where the server accepts external input.
## 3. Sensitive Information Protection
Protect personal, customer, confidential, and security-sensitive information.
Technology Owners should:
- Collect only necessary information
- Avoid exposing sensitive information in responses
- Avoid logging sensitive information
- Avoid sending unnecessary sensitive information to third-party services
- Use appropriate access controls
- Use secure transmission mechanisms
- Remove unnecessary sensitive data from development and test environments
Use fake, masked, or sanitized data where real sensitive information is not required.
## 4. Authentication
Use safe and established authentication mechanisms.
Authentication must:
- Verify user identity
- Protect credentials
- Use secure session or token handling
- Avoid exposing authentication secrets
- Reject invalid authentication attempts
- Follow the security requirements of the application
Do not implement custom authentication mechanisms when an approved and appropriate authentication solution is available.
## 5. Authorization and Access Control
Authentication alone is not sufficient.
Systems must verify that an authenticated user is allowed to perform the requested action.
Check:
- User permissions
- Roles
- Resource ownership
- Administrative privileges
- API authorization
- Access to sensitive operations
> Every protected operation must enforce the appropriate authorization rules.
Do not rely only on hiding UI controls to enforce permissions.
## 6. API Security
APIs must be protected against unauthorized and unsafe use.
Where applicable:
- Validate request input
- Authenticate protected endpoints
- Authorize requested actions
- Validate request parameters
- Return appropriate errors
- Avoid exposing sensitive data
- Apply rate limiting where required
- Avoid leaking internal implementation details
- Protect sensitive endpoints from unauthorized access
## 7. Dependency Security
Dependencies must be reviewed for known security risks.
Technology Owners should:
- Keep dependencies reasonably up to date
- Review security advisories
- Remove unnecessary dependencies
- Avoid untrusted packages
- Resolve serious dependency vulnerabilities before release where applicable
Dependency updates must also be tested to avoid introducing regressions.
## 8. Secure Coding
Code should follow secure development practices.
Avoid:
- Hardcoded secrets
- Unsafe input handling
- Unnecessary privileged operations
- Insecure defaults
- Sensitive information in logs
- Unsafe error messages
- Unnecessary data exposure
- Bypassing authorization checks
- Disabling security controls without justification
Use established libraries and project patterns where appropriate.
## 9. Security Testing
Security must be tested at appropriate levels.
Where applicable, use:
- Unit tests for security-related business rules
- API security tests
- Authentication tests
- Authorization tests
- Input validation tests
- Dependency security checks
- OWASP ZAP
- Appropriate penetration or security testing
Security testing should cover both expected behavior and important failure cases.
## 10. Security Review
Before merge, review applicable security concerns.
Check:
- Secrets are not committed
- Input is validated
- Authentication is appropriate
- Authorization is enforced
- Sensitive data is protected
- APIs are protected
- Dependencies are acceptable
- Security tests are present where required
AI-assisted reviews may identify security risks, but Technology Owners remain responsible for evaluating and resolving them.
## 11. Logging and Monitoring
Logs and monitoring must support investigation without exposing sensitive information.
Do not log:
- Passwords
- API keys
- Access tokens
- Private keys
- Authentication credentials
- Unnecessary personal sensitive data
Where appropriate, monitor:
- Authentication failures
- Authorization failures
- API abuse
- Unexpected errors
- Security-related events
- Suspicious activity
## 12. Security Problems Before Release
Serious security problems must be resolved before release.
Examples include:
- Exposed production credentials
- Authentication bypass
- Authorization bypass
- Sensitive data exposure
- Critical input validation failures
- Serious dependency vulnerabilities
- Unprotected sensitive APIs
A feature should not be released while a serious unresolved security risk remains unless an explicitly authorized risk decision permits it.
## 13. Production Security
Production systems require appropriate protection.
Before production deployment, verify:
- Production secrets are securely configured
- Access controls are enabled
- Authentication is configured correctly
- Authorization is working
- Sensitive data is protected
- Required security checks have passed
- Monitoring is available
- Rollback or recovery procedures are understood
Never use production credentials in development or test environments unless explicitly required and securely controlled.
## 14. Security Incident Response
When a security problem is discovered:
1. Assess the impact.
2. Contain the problem.
3. Protect or rotate affected credentials where applicable.
4. Prevent further exposure.
5. Investigate the root cause.
6. Apply the required fix.
7. Test the fix.
8. Document the incident and corrective actions.
## 15. Definition of Done
Where security is applicable, a feature is not technically ready until:
- Secrets are protected
- Input validation is implemented
- Authentication is appropriate
- Authorization is enforced
- Sensitive information is protected
- APIs are secured
- Dependencies are checked
- Required security tests pass
- Serious security problems are resolved
- Security review is complete
## Key Principle
> Protect secrets, validate input, enforce access control, protect sensitive information, secure APIs, test security, and resolve serious security problems before release.
