# AI-Assisted Development
## Purpose
AI is part of the normal Technology development workflow.
AI can support the Technology Owner across understanding, planning, implementation, testing, review, security, performance, quality, and documentation.
AI is an engineering assistant, not the owner of the engineering decision.
## Technology Principle
> The Technology Owner remains responsible for the code.
AI-generated suggestions, code, tests, documentation, and recommendations must be reviewed and validated before they are accepted.
AI does not make the final engineering decision.
## Approved AI-Assisted Activities
### 1. Understand Code
AI can help:
- Explain unfamiliar code
- Explain functions and modules
- Explain dependencies
- Explain data flow
- Identify relationships between components
- Summarize existing implementation
The Technology Owner must verify the explanation against the actual code.
### 2. Create Implementation Plans
AI can help:
- Break requirements into technical tasks
- Propose implementation approaches
- Identify dependencies
- Identify risks
- Compare alternatives
- Suggest implementation sequences
The Technology Owner selects and approves the final approach.
### 3. Write Code
AI can help:
- Generate boilerplate
- Suggest implementations
- Create functions and components
- Refactor existing code
- Suggest error handling
- Explain APIs and libraries
All AI-generated code must be reviewed before acceptance.
### 4. Explain Code
AI can help:
- Explain implementation decisions
- Explain complex logic
- Create technical documentation
- Prepare code walkthroughs
- Explain changes to other team members
### 5. Find Bugs
AI can help:
- Analyze error messages
- Analyze logs
- Identify suspicious code
- Suggest possible root causes
- Propose debugging approaches
- Suggest fixes
The proposed cause and fix must be verified by testing and investigation.
### 6. Create Tests
AI can help:
- Generate unit-test scenarios
- Generate integration-test scenarios
- Generate E2E scenarios
- Identify edge cases
- Identify missing coverage
- Suggest negative test cases
Generated tests must be reviewed and executed.
### 7. Review Tests
AI can help:
- Review test quality
- Identify weak assertions
- Identify duplicated tests
- Identify missing scenarios
- Identify flaky-test risks
- Suggest additional coverage
The Technology Owner remains responsible for deciding whether test coverage is sufficient.
### 8. Review Security
AI can help:
- Identify potential vulnerabilities
- Review authentication and authorization logic
- Identify unsafe input handling
- Identify secret-handling risks
- Identify dependency risks
- Suggest secure coding improvements
AI security suggestions must be validated using the project's security practices and appropriate security tools.
Never provide passwords, API keys, tokens, private credentials, or other secrets to AI.
### 9. Improve Performance
AI can help:
- Identify potential bottlenecks
- Suggest optimization approaches
- Analyze performance-related code
- Suggest caching strategies
- Suggest database/query improvements
- Interpret profiling or benchmark results
Performance changes must be measured and validated rather than assumed to improve performance.
### 10. Improve Code Quality
AI can help:
- Identify duplication
- Improve readability
- Suggest refactoring
- Identify maintainability problems
- Suggest clearer naming
- Improve structure
Code-quality improvements must preserve correct behavior and pass validation.
### 11. Create Documentation
AI can help:
- Draft README content
- Explain architecture
- Create API documentation
- Document technical decisions
- Create setup instructions
- Improve existing documentation
Documentation must be checked against the actual implementation.
## Human Engineering Responsibility
The Technology Owner is responsible for:
- Understanding the requirement
- Selecting the implementation approach
- Reviewing AI output
- Checking correctness
- Checking security
- Running tests
- Reviewing test results
- Reviewing code quality
- Validating performance claims
- Approving technical decisions
- Approving code before merge
- Approving deployment
AI recommendations are suggestions, not final engineering decisions.
## AI-Assisted Development Gate
Before accepting AI-assisted work, verify:
- Requirement is understood
- Implementation approach is understood
- AI-generated code has been reviewed
- Tests have been created where appropriate
- Tests have been executed
- Security implications have been considered
- Performance implications have been considered where relevant
- Code quality has been reviewed
- Documentation is accurate
- The Technology Owner approves the result
## Standard Development Flow
Requirement
    ↓
Understand
    ↓
Break Down
    ↓
Plan
    ↓
AI-Assisted Build
    ↓
Explain
    ↓
Test
    ↓
Review
    ↓
Improve
    ↓
Validate
    ↓
Deploy
## Non-Negotiable Rule
Do not treat AI output as automatically correct.
Do not merge AI-generated code without appropriate human review and validation.
Do not allow AI to make the final engineering decision.
## Key Principle
> AI assists. The Technology Owner decides.
