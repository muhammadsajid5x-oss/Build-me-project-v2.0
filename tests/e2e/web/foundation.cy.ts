/// <reference types="cypress" />

describe("Web foundation flow", () => {
  it("opens the foundation page, runs its action, and shows the result", () => {
    cy.visit("/foundation-test");

    cy.contains("h1", "Foundation Test Page").should("be.visible");

    cy.contains("button", "Run Foundation Test").click();

    cy.get("output")
      .should("be.visible")
      .and("contain.text", "Foundation test passed.");
  });
});
