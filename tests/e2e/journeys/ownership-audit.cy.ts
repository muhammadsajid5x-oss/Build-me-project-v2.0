describe("Ownership Audit visitor journey", () => {
  function trackAnalyticsEvents(): void {
    cy.intercept("POST", "**/api/v1/analytics/events").as("analyticsEvent");
  }

  function getOpenModal(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy
      .get(".ui-modal[open]")
      .filter(":visible")
      .should("have.length", 1);
  }

  function openOwnershipAudit(): void {
    cy.visit("/");

    cy.contains("button", "Get Quick Wins").should("be.visible").click();

    cy.contains("button", "Ownership Audit").should("be.visible").click();

    getOpenModal().within(() => {
      cy.contains("h3", "Technology Ownership Audit").should("be.visible");

      cy.contains("button", "Start Ownership Audit")
        .should("be.visible")
        .should("not.be.disabled");
    });
  }

  function startAuditAndEnterDetails(): void {
    getOpenModal().within(() => {
      cy.contains("button", "Start Ownership Audit")
        .should("be.visible")
        .should("not.be.disabled")
        .click();
    });

    getOpenModal().within(() => {
      cy.contains("h3", "Visitor Details").should("be.visible");

      cy.get('input[type="text"]')
        .should("be.visible")
        .clear()
        .type("Test Visitor");

      cy.get('input[type="email"]')
        .should("be.visible")
        .clear()
        .type("test@example.com");

      cy.contains("button", "Continue")
        .should("be.visible")
        .should("not.be.disabled")
        .click();

      cy.contains("Step 2 of 3").should("be.visible");
      cy.contains("Question 01").should("be.visible");
    });
  }

  function selectAnswer(questionNumber: number, value: "A" | "B" | "C"): void {
    getOpenModal().within(() => {
      cy.get(`input[name="question-${questionNumber}"][value="${value}"]`)
        .should("exist")
        .check();
    });
  }

  function clickNext(expectedQuestion: number): void {
    const previousQuestion = expectedQuestion - 2;

    getOpenModal().within(() => {
      cy.contains(
        `Question ${String(previousQuestion).padStart(2, "0")}`,
      ).should("be.visible");

      cy.contains("button", "Next")
        .should("be.visible")
        .should("not.be.disabled")
        .click();
    });

    getOpenModal().within(() => {
      cy.contains(
        `Question ${String(expectedQuestion).padStart(2, "0")}`,
      ).should("be.visible");
    });
  }

  function mockSuccessfulAuditSubmission(): void {
    cy.intercept("POST", "**/api/v1/ownership-audits", (request) => {
      const expectedBody = {
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
      };

      expect(request.body).to.deep.equal(expectedBody);

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
    selectAnswer(1, "C");
    selectAnswer(2, "C");
    clickNext(3);

    selectAnswer(3, "C");
    selectAnswer(4, "C");
    clickNext(5);

    selectAnswer(5, "C");
    selectAnswer(6, "C");
    clickNext(7);

    selectAnswer(7, "C");
    selectAnswer(8, "C");
    clickNext(9);

    selectAnswer(9, "C");
    selectAnswer(10, "C");
  }

  function completeAudit(): void {
    answerAllQuestionsWithC();

    getOpenModal().within(() => {
      cy.contains("button", "Continue to Score")
        .should("be.visible")
        .should("not.be.disabled")
        .click();
    });

    cy.wait("@createOwnershipAudit");

    getOpenModal().within(() => {
      cy.contains("Step 3 of 3").should("be.visible");
      cy.contains("Your Ownership Audit Results").should("be.visible");
    });
  }

  it("renders the Ownership Audit and starts the three-step journey", () => {
    openOwnershipAudit();

    getOpenModal().within(() => {
      cy.contains("Step 1 of 3").should("be.visible");
      cy.contains("Technology Ownership Audit").should("be.visible");

      cy.contains("button", "Start Ownership Audit")
        .should("be.visible")
        .click();

      cy.contains("Visitor Details").should("be.visible");
      cy.contains("Step 1 of 3").should("be.visible");
    });
  });

  it("validates visitor details before entering the questions", () => {
    openOwnershipAudit();

    getOpenModal().within(() => {
      cy.contains("button", "Start Ownership Audit")
        .should("be.visible")
        .click();

      cy.contains("button", "Continue").should("be.visible").click();

      cy.contains("Please enter your full name.").should("be.visible");

      cy.get('input[type="text"]').should("be.visible").type("Test Visitor");

      cy.contains("button", "Continue").should("be.visible").click();

      cy.contains("Please enter a valid email address.").should("be.visible");

      cy.get('input[type="email"]')
        .should("be.visible")
        .type("test@example.com");

      cy.contains("button", "Continue").should("be.visible").click();

      cy.contains("Step 2 of 3").should("be.visible");
      cy.contains("Question 01").should("be.visible");
    });
  });

  it("navigates through all five question pages", () => {
    trackAnalyticsEvents();

    openOwnershipAudit();
    startAuditAndEnterDetails();

    getOpenModal().within(() => {
      cy.contains("Question 01").should("be.visible");
      cy.contains("Question 02").should("be.visible");
    });

    selectAnswer(1, "C");
    selectAnswer(2, "C");
    clickNext(3);

    getOpenModal().within(() => {
      cy.contains("Question 03").should("be.visible");
      cy.contains("Question 04").should("be.visible");
    });

    selectAnswer(3, "C");
    selectAnswer(4, "C");
    clickNext(5);

    getOpenModal().within(() => {
      cy.contains("Question 05").should("be.visible");
      cy.contains("Question 06").should("be.visible");
    });

    selectAnswer(5, "C");
    selectAnswer(6, "C");
    clickNext(7);

    getOpenModal().within(() => {
      cy.contains("Question 07").should("be.visible");
      cy.contains("Question 08").should("be.visible");
    });

    selectAnswer(7, "C");
    selectAnswer(8, "C");
    clickNext(9);

    getOpenModal().within(() => {
      cy.contains("Question 09").should("be.visible");
      cy.contains("Question 10").should("be.visible");
    });
  });

  it("shows validation when both questions on a page are unanswered", () => {
    openOwnershipAudit();
    startAuditAndEnterDetails();

    getOpenModal().within(() => {
      cy.contains("button", "Next")
        .should("be.visible")
        .should("not.be.disabled")
        .click();

      cy.contains("Please answer both questions before continuing.").should(
        "be.visible",
      );
    });
  });

  it("completes the audit with all C answers and shows Strong Ownership", () => {
    openOwnershipAudit();
    startAuditAndEnterDetails();

    mockSuccessfulAuditSubmission();
    completeAudit();

    getOpenModal().within(() => {
      cy.contains("100").should("be.visible");
      cy.contains("out of 100").should("be.visible");
      cy.contains("Strong Ownership").should("be.visible");
      cy.contains("Coffee With Me").should("be.visible");
      cy.contains("Retake Audit").should("be.visible");
    });
  });

  it("allows the visitor to retake the audit from the results", () => {
    openOwnershipAudit();
    startAuditAndEnterDetails();

    mockSuccessfulAuditSubmission();
    completeAudit();

    getOpenModal().within(() => {
      cy.contains("button", "Retake Audit").should("be.visible").click();
    });

    getOpenModal().within(() => {
      cy.contains("Technology Ownership Audit").should("be.visible");
      cy.contains("Step 1 of 3").should("be.visible");
    });
  });
});
