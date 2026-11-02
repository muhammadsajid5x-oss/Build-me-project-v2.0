describe("Ownership Audit visitor journey", () => {
  function trackAnalyticsEvents(): void {
    cy.intercept("POST", "**/api/v1/analytics/events").as("analyticsEvent");
  }

  function openOwnershipAudit(): void {
    cy.visit("/");

    // Open the separate Get Quick Wins card.
    cy.contains("button", "Get Quick Wins").should("be.visible").click();

    // Select Ownership Audit from that card.
    cy.contains("button", "Ownership Audit").should("be.visible").click();

    // Confirm that the audit modal has opened.
    cy.contains("h3", "Technology Ownership Audit").should("be.visible");

    cy.contains("button", "Start Ownership Audit").should("be.visible");
  }

  function startAuditAndEnterDetails(): void {
    cy.contains("button", "Start Ownership Audit").should("be.visible").click();

    cy.contains("h3", "Visitor Details").should("be.visible");

    cy.get('input[type="text"]')
      .should("be.visible")
      .clear()
      .type("Test Visitor");

    cy.get('input[type="email"]')
      .should("be.visible")
      .clear()
      .type("test@example.com");

    cy.contains("button", "Continue").should("be.visible").click();

    cy.contains("Step 2 of 3").should("be.visible");
  }

  function selectAnswer(questionNumber: number, value: "A" | "B" | "C"): void {
    cy.get(`input[name="question-${questionNumber}"][value="${value}"]`)
      .should("exist")
      .check({ force: true });
  }

  function clickNext(): void {
    cy.contains("button", "Next").should("be.visible").click();
  }

  function mockSuccessfulAuditSubmission(): void {
    cy.intercept("POST", "**/api/v1/ownership-audits", (request) => {
      expect(request.body).to.deep.equal({
        fullName: "Test Visitor",
        visitorEmail: "test@example.com",
        answers: {
          q1: "C",
          q2: "C",
          q3: "C",
          q4: "C",
          q5: "C",
          q6: "C",
          q7: "C",
          q8: "C",
          q9: "C",
          q10: "C",
        },
      });

      request.reply({
        statusCode: 201,
        body: {
          data: {
            id: "audit-test-id",
            visitorEmail: "test@example.com",
            answers: {
              fullName: "Test Visitor",
              q1: "C",
              q2: "C",
              q3: "C",
              q4: "C",
              q5: "C",
              q6: "C",
              q7: "C",
              q8: "C",
              q9: "C",
              q10: "C",
            },
            score: 100,
            category: "Strong Ownership",
            createdAt: "2026-11-01T00:00:00.000Z",
          },
        },
      });
    }).as("createOwnershipAudit");
  }

  function answerAllQuestionsWithC(): void {
    for (let question = 1; question <= 10; question += 1) {
      selectAnswer(question, "C");

      if (question % 2 === 0 && question < 10) {
        clickNext();
      }
    }
  }

  function completeAudit(): void {
    answerAllQuestionsWithC();

    cy.contains("button", "Continue to Score").should("be.visible").click();

    cy.wait("@createOwnershipAudit");

    cy.contains("Step 3 of 3").should("be.visible");

    cy.contains("Your Ownership Audit Results").should("be.visible");
  }

  it("renders the Ownership Audit and starts the three-step journey", () => {
    openOwnershipAudit();

    cy.contains("Step 1 of 3").should("be.visible");

    cy.contains("Technology Ownership Audit").should("be.visible");

    cy.contains("button", "Start Ownership Audit").should("be.visible").click();

    cy.contains("Visitor Details").should("be.visible");

    cy.contains("Step 1 of 3").should("be.visible");
  });

  it("validates visitor details before entering the questions", () => {
    openOwnershipAudit();

    cy.contains("button", "Start Ownership Audit").should("be.visible").click();

    cy.contains("button", "Continue").should("be.visible").click();

    cy.contains("Please enter your full name.").should("be.visible");

    cy.get('input[type="text"]').should("be.visible").type("Test Visitor");

    cy.contains("button", "Continue").should("be.visible").click();

    cy.contains("Please enter a valid email address.").should("be.visible");

    cy.get('input[type="email"]').should("be.visible").type("test@example.com");

    cy.contains("button", "Continue").should("be.visible").click();

    cy.contains("Step 2 of 3").should("be.visible");

    cy.contains("Question 01").should("be.visible");
  });

  it("navigates through all five question pages", () => {
    trackAnalyticsEvents();

    openOwnershipAudit();
    startAuditAndEnterDetails();

    cy.contains("Question 01").should("be.visible");
    cy.contains("Question 02").should("be.visible");

    selectAnswer(1, "C");
    selectAnswer(2, "C");
    clickNext();

    cy.contains("Question 03").should("be.visible");
    cy.contains("Question 04").should("be.visible");

    selectAnswer(3, "C");
    selectAnswer(4, "C");
    clickNext();

    cy.contains("Question 05").should("be.visible");
    cy.contains("Question 06").should("be.visible");

    selectAnswer(5, "C");
    selectAnswer(6, "C");
    clickNext();

    cy.contains("Question 07").should("be.visible");
    cy.contains("Question 08").should("be.visible");

    selectAnswer(7, "C");
    selectAnswer(8, "C");
    clickNext();

    cy.contains("Question 09").should("be.visible");
    cy.contains("Question 10").should("be.visible");
  });

  it("shows validation when both questions on a page are unanswered", () => {
    openOwnershipAudit();
    startAuditAndEnterDetails();

    clickNext();

    cy.contains("Please answer both questions before continuing.").should(
      "be.visible",
    );
  });

  it("completes the audit with all C answers and shows Strong Ownership", () => {
    openOwnershipAudit();
    startAuditAndEnterDetails();

    mockSuccessfulAuditSubmission();
    completeAudit();

    cy.contains("100").should("be.visible");
    cy.contains("out of 100").should("be.visible");
    cy.contains("Strong Ownership").should("be.visible");
    cy.contains("Coffee With Me").should("be.visible");
    cy.contains("Retake Audit").should("be.visible");
  });

  it("allows the visitor to retake the audit from the results", () => {
    openOwnershipAudit();
    startAuditAndEnterDetails();

    mockSuccessfulAuditSubmission();
    completeAudit();

    cy.contains("button", "Retake Audit").should("be.visible").click();

    cy.contains("Technology Ownership Audit").should("be.visible");

    cy.contains("Step 1 of 3").should("be.visible");
  });
});
