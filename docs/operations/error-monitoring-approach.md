# Error Monitoring Approach

## 1. Purpose

The purpose of this Error Monitoring Approach is to make sure application and system errors are detected, recorded, reviewed, and resolved consistently.

The process is:

**Error → Detect → Log → Alert / Review → Fix**

This approach applies to the Build Me Web application, Dashboard, API, and supporting technology services.

---

## 2. Error Monitoring Flow

```text
Error
  ↓
Detect
  ↓
Log
  ↓
Alert / Review
  ↓
Fix
  ↓
Verify
  ↓
Learn / Improve
```

---

## 3. Error

An error is any unexpected condition that causes a system operation to fail, behave incorrectly, or produce an unexpected result.

Examples:

- API request failure
- Database connection failure
- Authentication failure
- Authorization failure
- Frontend runtime error
- Failed deployment
- External service failure
- Unexpected server error
- Security-related error
- Performance-related failure

Errors must not be ignored when they can affect users, system reliability, security, or delivery.

---

## 4. Detect

Errors should be detected through available technical controls.

### Detection Sources

- Frontend runtime errors
- API error responses
- Server/application logs
- Database errors
- Automated tests
- CI/CD pipeline failures
- Deployment failures
- Health checks
- Monitoring checks
- Security checks
- Performance checks
- User-reported problems

### Detection Goal

The goal is to identify an error as close as possible to the point where it occurs.

---

## 5. Log

Detected errors must produce useful technical information for investigation.

### Minimum Error Information

Where applicable, capture:

- Error message
- Error type
- Timestamp
- Application/service
- Environment
- Request or operation
- HTTP status code
- Relevant technical context
- Stack trace
- Correlation/request ID
- Deployment/version information

### Logging Rules

Logs must:

- Be useful for investigation.
- Avoid exposing passwords, tokens, secrets, or sensitive personal information.
- Use consistent error messages and levels.
- Provide enough context to reproduce or investigate the problem.

Example:

```text
ERROR
Service: Build Me API
Environment: Production
Operation: POST /api/v1/leads
Timestamp: 2026-10-02T00:00:00Z
Status: 500
Error: Database operation failed
Request ID: <request-id>
```

---

## 6. Alert / Review

Not every error requires an immediate alert.

Errors should be reviewed based on their impact and frequency.

### Immediate Review

Prioritise errors that:

- Affect users.
- Stop an important system function.
- Affect production availability.
- Create a security risk.
- Cause repeated failures.
- Cause data integrity concerns.
- Prevent deployment or recovery.

### Normal Review

Lower-impact errors can be reviewed through:

- Application logs
- Monitoring dashboards
- CI/CD results
- Test reports
- Regular Technology reviews
- Error trend analysis

---

## 7. Fix

After an error is identified:

1. Understand the error.
2. Identify the root cause.
3. Create or update a technical task if required.
4. Implement the fix.
5. Run appropriate tests.
6. Perform technical validation.
7. Deploy through the normal delivery process.
8. Verify that the error is resolved.
9. Monitor for recurrence.

The fix should address the underlying technical cause where practical rather than only hiding the error.

---

## 8. Verification

After fixing an error, verify:

- The original error no longer occurs.
- The affected functionality works correctly.
- Relevant automated tests pass.
- No new related errors were introduced.
- Production or target environment behaves correctly.
- Monitoring/logging continues to work.

---

## 9. Learning and Continuous Improvement

Important errors should feed into the Technology learning process.

Use:

**Error → Investigation → Learning → Action → Improvement**

Possible improvements include:

- New automated tests
- Better error handling
- Better logging
- New monitoring checks
- Improved alerts
- Documentation updates
- Security improvements
- Performance improvements
- CI/CD improvements
- Architecture improvements

---

## 10. Technology Ownership

Technology Ownership is responsible for the technical error-monitoring lifecycle:

- Detect technical errors
- Ensure useful technical logs exist
- Review technical impact
- Investigate technical causes
- Implement technical fixes
- Test fixes
- Validate technical readiness
- Deploy fixes
- Monitor the result
- Recover when required
- Analyse recurring problems
- Continuously improve the system

Product acceptance remains a Product Ownership responsibility.

---

## 11. Evidence

The Error Monitoring Approach should be supported by practical evidence.

### Evidence Examples

- Application error logs
- API error responses
- Health-check results
- CI/CD failure and recovery records
- Automated test results
- Security test results
- Monitoring records
- Error investigation records
- Pull requests containing error fixes
- Deployment records
- Before/after verification

---

## 12. Foundation Checklist

| Requirement                         | Status |
| ----------------------------------- | ------ |
| Error monitoring process documented | ✅     |
| Detection methods identified        | ✅     |
| Logging approach defined            | ✅     |
| Alert/review approach defined       | ✅     |
| Fix process defined                 | ✅     |
| Verification step defined           | ✅     |
| Learning/improvement included       | ✅     |
| Technology ownership defined        | ✅     |
| Evidence identified                 | ✅     |
| Practical error-monitoring evidence | ⬜     |

---

## 13. Practical Validation

The foundation is not complete with documentation alone.

Perform one practical test using a controlled, non-production error.

Example:

```text
Create controlled error
        ↓
Confirm error is detected
        ↓
Confirm useful log is created
        ↓
Review the error
        ↓
Fix the issue
        ↓
Run tests
        ↓
Verify the error is resolved
```

Record the result as evidence.

**Important:** Do not intentionally create an uncontrolled error in production. Use local development, a test environment, or another safe environment.

---

## 14. Success Criteria

The Error Monitoring Foundation is successful when the Technology team can clearly demonstrate:

1. An error can be detected.
2. The error produces useful technical information.
3. The error can be reviewed and investigated.
4. A technical fix can be implemented.
5. The fix can be tested and verified.
6. The result can be monitored.
7. Important learning can be reused to improve the system.
