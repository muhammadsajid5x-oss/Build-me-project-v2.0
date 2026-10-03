# AI Debugging Workflow
## Purpose
AI can assist the Technology Owner when software breaks or behaves unexpectedly.
The debugging process must focus on understanding the problem before changing code.
## Technology Principle
> Diagnose first. Change second.
Do not immediately ask AI to modify broken code.
## Do Not Use This Shortcut
Do not simply ask:
> Fix this.
This provides insufficient context and can lead to incorrect or unnecessary changes.
## Required Debugging Context
Before asking AI to diagnose a problem, provide:
### 1. What I Expected
Describe the behavior that should have happened.
### 2. What Happened
Describe the actual behavior.
### 3. Error Message
Provide the relevant error message, stack trace, or failure output.
Do not include passwords, API keys, tokens, private credentials, or other secrets.
### 4. Relevant Code
Provide only the code needed to understand the problem.
Avoid unnecessarily sharing unrelated code or sensitive information.
### 5. Steps to Reproduce
Describe the exact or reliable steps that cause the problem.
### 6. What I Already Tried
Explain:
- Troubleshooting already performed
- Changes already attempted
- Tests already run
- Relevant results
## Standard AI Debugging Questions
### Step 1 — Find the Likely Cause
Ask:
> Find the likely cause. Do not change the code yet.
AI should analyze the available evidence and explain the likely cause.
The Technology Owner must verify the diagnosis against the actual implementation and evidence.
### Step 2 — Generate Possible Fixes
After the likely cause has been understood, ask:
> Give me two possible fixes.
AI should provide two reasonable approaches and explain their expected impact.
### Step 3 — Compare the Fixes
Ask:
> Explain which fix is safer and why.
The comparison should consider:
- Correctness
- Security
- Maintainability
- Complexity
- Regression risk
- Performance
- Scope of change
- Compatibility
The Technology Owner makes the final decision.
## Implementation
After selecting an appropriate fix:
- Implement the chosen solution
- Keep the change focused
- Avoid unrelated changes
- Review the implementation
- Confirm the original requirement remains satisfied
AI-generated fixes must be reviewed before acceptance.
## Test
After implementing the fix:
- Reproduce the original problem
- Verify that the problem is resolved
- Run relevant automated tests
- Run relevant regression tests
- Verify related functionality
- Check for new errors
Do not assume the problem is fixed because the code changed successfully.
## Validate
Confirm:
- Original failure no longer occurs
- Expected behavior now occurs
- No relevant regression was introduced
- Tests pass
- The solution addresses the actual root cause
## Debugging Flow
Problem
    ↓
Expected behavior
    ↓
Actual behavior
    ↓
Error message
    ↓
Relevant code
    ↓
Reproduction steps
    ↓
Previous attempts
    ↓
AI diagnosis
    ↓
Verify likely cause
    ↓
Two possible fixes
    ↓
Compare safety and trade-offs
    ↓
Technology Owner selects fix
    ↓
Implement
    ↓
Test
    ↓
Validate
## Human Responsibility
The Technology Owner remains responsible for:
- Providing accurate debugging context
- Verifying the diagnosis
- Selecting the fix
- Reviewing the implementation
- Running tests
- Validating the result
- Deciding whether the issue is resolved
AI recommendations are not automatically correct.
## Security Rules
Never provide AI with:
- Passwords
- API keys
- Access tokens
- Private credentials
- Authentication secrets
- Other sensitive secrets
Sanitize logs, configuration, and code before sharing them with AI.
## Non-Negotiable Rules
1. Do not start with "Fix this."
2. Provide sufficient debugging context.
3. Ask AI to diagnose before changing code.
4. Ask for two possible fixes.
5. Compare the fixes before implementation.
6. The Technology Owner selects the fix.
7. Test every implemented fix.
8. Validate that the original problem is actually resolved.
9. Check for regressions.
10. Never provide secrets to AI.
## Key Principle
> Diagnose first. Change second.
