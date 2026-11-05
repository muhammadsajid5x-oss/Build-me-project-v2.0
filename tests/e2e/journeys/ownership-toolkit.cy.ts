describe("Ownership Toolkit visitor journey", () => {
  function openOwnershipToolkit(): void {
    cy.visit("/");

    cy.contains("button", "Get Quick Wins").should("be.visible").click();

    cy.contains("button", "Ownership Toolkit").should("be.visible").click();

    cy.contains("Technology Ownership Toolkit").should("be.visible");
    cy.contains("Step 1 of 3").should("be.visible");
  }

  function goToVisitorDetails(): void {
    cy.contains("button", "Continue Next Step").should("be.visible").click();

    cy.contains("Access the Toolkit").should("be.visible");
    cy.contains("Step 2 of 3").should("be.visible");
  }

  function enterVisitorDetails(): void {
    cy.get("#toolkit-full-name")
      .should("be.visible")
      .clear()
      .type("Test Toolkit Visitor");

    cy.get("#toolkit-visitor-email")
      .should("be.visible")
      .clear()
      .type("toolkit-test@example.com");

    cy.contains("button", "Access Toolkit").should("be.visible").click();
  }

  function mockSuccessfulToolkitAccess(): void {
    cy.intercept("POST", "**/api/v1/ownership-toolkit-accesses", (request) => {
      expect(request.body).to.deep.equal({
        fullName: "Test Toolkit Visitor",
        visitorEmail: "toolkit-test@example.com",
      });

      request.reply({
        statusCode: 201,
        body: {
          data: {
            id: "ownership-toolkit-test-id",
            userId: null,
            fullName: "Test Toolkit Visitor",
            visitorEmail: "toolkit-test@example.com",
            createdAt: "2026-11-01T00:00:00.000Z",
          },
        },
      });
    }).as("createOwnershipToolkitAccess");
  }

  it("opens the Ownership Toolkit journey", () => {
    openOwnershipToolkit();

    cy.contains("Why use the Technology Ownership Toolkit?").should(
      "be.visible",
    );

    cy.contains("button", "Continue Next Step").should("be.visible");
  });

  it("validates visitor details before submitting", () => {
    openOwnershipToolkit();

    goToVisitorDetails();

    cy.contains("button", "Access Toolkit").should("be.visible").click();

    cy.contains("Please enter your full name.").should("be.visible");

    cy.get("#toolkit-full-name")
      .should("be.visible")
      .type("Test Toolkit Visitor");

    cy.contains("button", "Access Toolkit").should("be.visible").click();

    cy.contains("Please enter a valid email address.").should("be.visible");

    cy.get("#toolkit-visitor-email")
      .should("be.visible")
      .type("toolkit-test@example.com");
  });

  it("submits visitor details and shows the final Toolkit actions", () => {
    openOwnershipToolkit();

    goToVisitorDetails();

    mockSuccessfulToolkitAccess();

    enterVisitorDetails();

    cy.wait("@createOwnershipToolkitAccess");

    cy.contains("Step 3 of 3").should("be.visible");
    cy.contains("View Online").should("be.visible");
    cy.contains("Download PDF").should("be.visible");
  });

  it("opens the online Ownership Toolkit", () => {
    openOwnershipToolkit();

    goToVisitorDetails();

    mockSuccessfulToolkitAccess();

    enterVisitorDetails();

    cy.wait("@createOwnershipToolkitAccess");

    cy.contains("button", "View Online").should("be.visible").click();

    cy.url().should("include", "/ownership-toolkit");

    cy.contains("Technology Ownership Toolkit").should("be.visible");

    cy.contains("Plan it. Design it. Build it.").should("be.visible");
  });

  it("starts the PDF download from the final Toolkit actions", () => {
    openOwnershipToolkit();

    goToVisitorDetails();

    mockSuccessfulToolkitAccess();

    enterVisitorDetails();

    cy.wait("@createOwnershipToolkitAccess");

    cy.contains("button", "Download PDF").should("be.visible").click();

    cy.contains("Download PDF").should("be.visible");
  });
});
