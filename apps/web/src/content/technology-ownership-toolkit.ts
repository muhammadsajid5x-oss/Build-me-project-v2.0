export type ToolkitStage = {
  title: string;
  objective: string;
  checklist: string[];
  evidence: string[];
  ownershipQuestion: string;
};

export const technologyOwnershipToolkit = {
  title: "Technology Ownership Toolkit",
  subtitle:
    "A practical guide to taking responsibility for technology throughout its lifecycle.",

  introduction: {
    heading: "What is Technology Ownership?",
    description:
      "Technology Ownership is end-to-end responsibility for the technical implementation, quality, security, operational readiness, reliability, and continuous improvement of a technology solution. It goes beyond writing code or completing a development task.",
    principle:
      "Delivery does not end when code is written or deployed. A solution must be tested, operated, observed, secured, recoverable, analysed, and continuously improved.",
  },

  lifecycle: [
    {
      title: "1. Plan",
      objective:
        "Understand the technical work, dependencies, constraints, risks, and expected delivery approach before implementation begins.",
      checklist: [
        "Understand the agreed requirements and expected outcome.",
        "Identify technical scope, dependencies, and constraints.",
        "Break the work into clear, manageable tasks.",
        "Identify risks and required resources.",
        "Define how technical progress and completion will be verified.",
      ],
      evidence: [
        "Technical implementation plan.",
        "Task breakdown and dependencies.",
        "Identified risks and mitigation actions.",
        "Technical completion criteria.",
      ],
      ownershipQuestion:
        "Do I understand what needs to be delivered and how I will verify the technical result?",
    },
    {
      title: "2. Design",
      objective:
        "Define a suitable technical approach that considers architecture, data, interfaces, user experience constraints, security, and maintainability.",
      checklist: [
        "Select an appropriate technical approach.",
        "Identify affected components and system boundaries.",
        "Consider data structures and API contracts.",
        "Consider accessibility and responsive behaviour where relevant.",
        "Identify security and failure scenarios.",
        "Consider maintainability and future changes.",
      ],
      evidence: [
        "Architecture or technical design notes.",
        "API contracts and data models.",
        "Component or integration decisions.",
        "Documented technical trade-offs.",
      ],
      ownershipQuestion:
        "Can I explain why this technical approach is appropriate and how it affects the wider system?",
    },
    {
      title: "3. Build",
      objective:
        "Implement the agreed technical solution using consistent engineering practices and maintainable code.",
      checklist: [
        "Implement the planned functionality.",
        "Follow project conventions and coding standards.",
        "Handle expected errors and edge cases.",
        "Keep components and services maintainable.",
        "Avoid exposing secrets or sensitive information.",
        "Document important technical decisions.",
      ],
      evidence: [
        "Source code and reviewed changes.",
        "Pull request and commit history.",
        "Configuration and migration changes.",
        "Implementation notes where needed.",
      ],
      ownershipQuestion:
        "Is the implementation maintainable, secure, and aligned with the agreed technical design?",
    },
    {
      title: "4. Test",
      objective:
        "Verify that the implementation behaves correctly and that relevant technical risks and failure cases are addressed.",
      checklist: [
        "Run relevant unit tests.",
        "Verify API and component integration.",
        "Test important end-to-end journeys.",
        "Validate input handling and error states.",
        "Check accessibility and responsive behaviour where relevant.",
        "Record and resolve identified defects.",
      ],
      evidence: [
        "Unit and integration test results.",
        "End-to-end test results.",
        "Defect records and resolutions.",
        "Test coverage or verification notes.",
      ],
      ownershipQuestion:
        "What evidence demonstrates that the implementation works and handles expected failure conditions?",
    },
    {
      title: "5. Deploy",
      objective:
        "Release the verified technical solution through a controlled and repeatable deployment process.",
      checklist: [
        "Confirm required checks have passed.",
        "Verify environment configuration.",
        "Apply required database migrations safely.",
        "Confirm deployment dependencies and permissions.",
        "Deploy through the appropriate release process.",
        "Verify the deployed application and critical routes.",
      ],
      evidence: [
        "CI/CD pipeline results.",
        "Deployment records.",
        "Migration execution results.",
        "Post-deployment verification.",
      ],
      ownershipQuestion:
        "Can I demonstrate that the intended version was deployed successfully and safely?",
    },
    {
      title: "6. Operate and Observe",
      objective:
        "Maintain visibility into the behaviour, availability, performance, and health of the deployed solution.",
      checklist: [
        "Verify application availability.",
        "Monitor relevant errors and system behaviour.",
        "Review logs and operational signals.",
        "Track meaningful analytics and events.",
        "Check important user journeys.",
        "Identify and investigate abnormal behaviour.",
      ],
      evidence: [
        "Application and infrastructure logs.",
        "Monitoring or health-check results.",
        "Analytics records.",
        "Operational review notes.",
        "Incident or investigation records.",
      ],
      ownershipQuestion:
        "Can I detect whether the solution is working correctly after deployment?",
    },
    {
      title: "7. Secure",
      objective:
        "Protect the application, data, infrastructure, and users against relevant security threats.",
      checklist: [
        "Validate and sanitise untrusted inputs.",
        "Apply authentication and authorisation correctly.",
        "Protect sensitive data and secrets.",
        "Review dependencies and known vulnerabilities.",
        "Apply appropriate access controls.",
        "Check security-relevant logs and events.",
      ],
      evidence: [
        "Security test results.",
        "Dependency and vulnerability reports.",
        "Access-control verification.",
        "Security review findings.",
        "Documented remediation actions.",
      ],
      ownershipQuestion:
        "What evidence demonstrates that relevant security risks have been identified and addressed?",
    },
    {
      title: "8. Recover",
      objective:
        "Prepare the system to respond to failures and restore service or data when recovery is required.",
      checklist: [
        "Identify critical failure scenarios.",
        "Understand backup and restore arrangements.",
        "Define recovery or rollback procedures.",
        "Identify responsible people and escalation routes.",
        "Verify recovery steps where practical.",
        "Record recovery limitations and risks.",
      ],
      evidence: [
        "Backup and recovery procedures.",
        "Rollback instructions.",
        "Recovery test results.",
        "Incident and recovery records.",
      ],
      ownershipQuestion:
        "If this solution fails, do I know how it can be restored safely?",
    },
    {
      title: "9. Analyse",
      objective:
        "Use technical and operational evidence to understand outcomes, identify problems, and make informed decisions.",
      checklist: [
        "Review monitoring and analytics data.",
        "Analyse errors, incidents, and performance.",
        "Compare actual behaviour with expected technical outcomes.",
        "Identify recurring problems and root causes.",
        "Record findings and improvement opportunities.",
        "Use evidence rather than assumptions.",
      ],
      evidence: [
        "Analytics and monitoring reports.",
        "Incident analysis and root-cause findings.",
        "Performance results.",
        "Technical review notes.",
        "Prioritised improvement opportunities.",
      ],
      ownershipQuestion:
        "What does the available evidence tell me about the health and effectiveness of this solution?",
    },
    {
      title: "10. Continuously Improve",
      objective:
        "Use evidence and learning to improve technical quality, reliability, security, maintainability, and operational effectiveness.",
      checklist: [
        "Prioritise improvements based on evidence and risk.",
        "Address technical debt where appropriate.",
        "Improve automation and engineering workflows.",
        "Strengthen testing and monitoring.",
        "Review previous incidents and lessons learned.",
        "Verify that completed improvements produce the intended technical result.",
      ],
      evidence: [
        "Improvement backlog.",
        "Completed improvement records.",
        "Updated tests and automation.",
        "Before-and-after technical evidence.",
        "Lessons learned and follow-up actions.",
      ],
      ownershipQuestion:
        "What have I improved, and what evidence demonstrates that the improvement worked?",
    },
  ] satisfies ToolkitStage[],

  readinessChecklist: [
    "The technical scope and implementation approach are understood.",
    "The solution follows the agreed technical design.",
    "Relevant tests have passed.",
    "Known defects and risks have been assessed.",
    "Security controls have been verified.",
    "Deployment and configuration have been checked.",
    "The deployed solution has been verified.",
    "Monitoring, logs, and analytics provide appropriate visibility.",
    "Recovery or rollback arrangements are understood.",
    "Operational findings and improvement opportunities are recorded.",
  ],

  evidenceRecord: [
    "Work item and reference",
    "Expected technical outcome",
    "Requirements and constraints considered",
    "Design and technical decisions",
    "Implementation and code changes",
    "Testing and verification results",
    "Deployment and release evidence",
    "Operational and monitoring evidence",
    "Security checks and findings",
    "Recovery and rollback arrangements",
    "Analysis and lessons learned",
    "Continuous improvement actions",
  ],

  reviewQuestions: [
    "What technical outcome was delivered?",
    "What evidence demonstrates that the implementation works?",
    "How was the solution tested and deployed?",
    "How is the solution monitored and operated?",
    "What security risks were considered and addressed?",
    "How would the solution be recovered after a failure?",
    "What does the operational evidence tell us?",
    "What improvements have been identified or completed?",
  ],

  ownershipBoundaries: {
    productOwnership:
      "Product Ownership remains responsible for requirements, user experience, business priorities, expected product outcomes, and product acceptance.",
    technologyOwnership:
      "Technology Ownership is responsible for technical implementation, engineering quality, testing, security, technical validation, deployment readiness, operation, recovery, technical analysis, and continuous improvement.",
  },

  slogan:
    "Plan it. Design it. Build it. Test it. Deploy it. Observe it. Secure it. Recover it. Analyse it. Improve it.",
} as const;
