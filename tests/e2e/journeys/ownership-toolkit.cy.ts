describe("Ownership Toolkit", () => {
  it("completes toolkit access", () => {
    cy.intercept("POST", "**/api/v1/ownership-toolkit-accesses", {
      statusCode: 201,
      body: {
        data: {
          id: "test-id",
        },
      },
    }).as("access");

    cy.visit("/");

    cy.contains("button", "Get Quick Wins").should("be.visible").click();

    cy.contains("button", "Ownership Toolkit").should("be.visible").click();

    cy.contains("Technology Ownership Toolkit").should("be.visible");

    cy.contains("button", "Continue Next Step").should("be.visible").click();

    cy.get("#toolkit-full-name").should("be.visible").type("Test Visitor");

    cy.get("#toolkit-visitor-email")
      .should("be.visible")
      .type("test@example.com");

    cy.contains("button", "Access Toolkit").should("be.visible").click();

    cy.wait("@access");

    cy.contains("Step 3 of 3").should("be.visible");

    cy.contains("button", "View Online").should("be.visible");

    cy.contains("button", "Download PDF").should("be.visible");
  });
});
