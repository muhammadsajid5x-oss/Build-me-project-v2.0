# Technology AI Workflow
## Purpose
The Technology AI Workflow defines how AI is used throughout the Technology delivery lifecycle.
AI should support the Technology Owner from understanding a requirement through deployment and validation.
The workflow prevents the team from jumping directly from a requirement to code.
## Standard Workflow
Requirement
    ↓
Understand
    ↓
Break Down
    ↓
Plan
    ↓
Build
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
## Workflow Stages
### 1. Requirement
Capture and clarify what needs to be delivered.
AI can help:
- Understand the requirement
- Identify ambiguity
- Identify missing information
- Ask clarification questions
- Identify acceptance criteria
### 2. Understand
Build a clear understanding of the problem, users, business outcome, and technical context.
AI can help:
- Summarize requirements
- Explain unfamiliar concepts
- Identify assumptions
- Identify constraints
- Highlight risks
### 3. Break Down
Convert the requirement into smaller, understandable pieces of work.
AI can help:
- Decompose requirements
- Identify dependencies
- Identify edge cases
- Define technical tasks
- Identify testing needs
### 4. Plan
Create an implementation approach before writing code.
AI can help:
- Explore implementation options
- Compare approaches
- Identify trade-offs
- Propose architecture
- Identify risks
- Define a delivery sequence
### 5. Build
Implement the planned solution.
AI can help:
- Generate implementation suggestions
- Explain APIs and libraries
- Create boilerplate
- Refactor code
- Identify implementation issues
All AI-generated code must be reviewed and validated by the Technology Owner.
### 6. Explain
Make the implementation understandable.
AI can help:
- Explain code
- Explain architecture
- Generate documentation
- Explain technical decisions
- Prepare walkthroughs
### 7. Test
Verify that the implementation works correctly.
AI can help:
- Identify test scenarios
- Generate test cases
- Identify edge cases
- Analyze test failures
- Suggest additional coverage
Tests must be executed and verified rather than assumed to pass.
### 8. Review
Review the implementation before it is merged or released.
AI can help:
- Identify bugs
- Identify maintainability issues
- Identify security concerns
- Identify missing tests
- Review code quality
- Review technical consistency
AI review does not replace human code review.
### 9. Improve
Address findings from testing and review.
AI can help:
- Suggest fixes
- Refactor implementation
- Improve test coverage
- Improve maintainability
- Improve performance
Changes must be re-tested after improvement.
### 10. Validate
Confirm that the delivered solution meets the original requirement and expected outcome.
Validation should include:
- Functional validation
- Acceptance criteria validation
- Test results
- Security validation where applicable
- Performance validation where applicable
- User/outcome validation where applicable
### 11. Deploy
Release the validated solution through the approved deployment process.
AI can help:
- Review deployment plans
- Explain deployment configuration
- Analyze deployment failures
- Prepare release documentation
- Identify deployment risks
Deployment must follow the project's CI/CD and release controls.
## Non-Negotiable Rule
Do not use this shortcut:
Requirement → Code
The required workflow is:
Requirement → Understand
→ Break Down
→ Plan
→ Build
→ Explain
→ Test
→ Review
→ Improve
→ Validate
→ Deploy
Skipping stages can create misunderstood requirements, implementation mistakes, insufficient testing, security problems, and poor delivery outcomes.
## AI Safety Principles
- Never provide passwords, API keys, tokens, or other secrets to AI.
- Review AI-generated output before accepting it.
- Do not treat AI output as automatically correct.
- Run the required tests and validation.
- Keep important technical decisions owned by the Technology Owner.
- Use approved AI tools and project resources.
- Record important reusable learnings in the AI Workspace.


