describe("Ownership Audit", () => {
  it("completes audit", () => {
    cy.intercept("POST", "**/api/v1/ownership-audits", {
      statusCode: 201,
      body: { data: { score: 100 } },
    }).as("audit");

    cy.visit("/");
    cy.contains("Get Quick Wins").click();
    cy.contains("Ownership Audit").click();

    cy.get('input[type="text"]').type("Test Visitor");
    cy.get('input[type="email"]').type("test@example.com");
    cy.contains("Continue").click();

    for (let i = 1; i <= 10; i++) {
      cy.get(`input[name="question-${i}"][value="C"]`).check({ force: true });
    }

    cy.wait("@audit");
    cy.contains("Your Ownership Audit Results").should("be.visible");
    cy.contains("100").should("be.visible");
  });
});
