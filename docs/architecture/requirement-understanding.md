# AI Requirement Understanding
## Purpose
Before asking AI to write code, the Technology Owner must first provide the requirement and use AI to understand it.
The objective is to make sure the problem is understood before implementation begins.
## Technology Principle
> Understand first. Build second.
AI must not be used as a shortcut from:
Requirement → Code
The Technology Owner should first establish what is required, what is not required, and what remains unclear.
## Standard AI Questions
When a new requirement is received, provide the requirement to the approved AI tool and ask the following questions.
### 1. Explain the Requirement
Prompt:
> Explain this requirement in simple words.
Purpose:
- Understand the requirement clearly
- Remove unnecessary technical language
- Identify the main objective
### 2. Identify What the System Must Do
Prompt:
> What must the system do?
Purpose:
- Identify required system behavior
- Identify expected functionality
- Identify important user interactions
- Identify expected outcomes
### 3. Identify What Is Not Included
Prompt:
> What is not included?
Purpose:
- Establish scope boundaries
- Prevent unnecessary implementation
- Identify assumptions
- Reduce scope creep
### 4. Identify Unclear Questions
Prompt:
> What questions are still unclear?
Purpose:
- Find missing information
- Identify ambiguities
- Identify assumptions that need confirmation
- Identify questions that must be answered before planning or coding
## Requirement Understanding Output
The AI-assisted requirement analysis should produce:
### Requirement Summary
A simple explanation of what needs to be delivered.
### System Responsibilities
A clear list of what the system must do.
### Out of Scope
A clear list of what is not included.
### Open Questions
Questions that must be clarified before implementation.
### Assumptions
Any assumptions made while interpreting the requirement.
### Risks or Concerns
Potential risks, ambiguities, dependencies, or concerns identified during understanding.
## Human Validation
AI output is an aid to understanding and must not be treated as automatically correct.
The Technology Owner must:
- Review the AI interpretation
- Confirm the requirement against the original source
- Resolve important ambiguities
- Confirm scope
- Confirm assumptions
- Obtain clarification where required
- Approve the understanding before planning implementation
## Gate Before Planning
Do not move to the planning stage until:
- The requirement is understood
- Required system behavior is identified
- Out-of-scope items are identified
- Important questions are resolved or explicitly tracked
- Key assumptions are understood
- The Technology Owner agrees with the interpretation
## Standard Flow
Requirement
    ↓
Explain in simple words
    ↓
What must the system do?
    ↓
What is not included?
    ↓
What questions are still unclear?
    ↓
Human validation
    ↓
Break Down
    ↓
Plan
## Key Principle
> Understand first. Build second.
