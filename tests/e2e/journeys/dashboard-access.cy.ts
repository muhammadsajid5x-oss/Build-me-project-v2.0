/// <reference types="cypress" />
describe("Build Me User Journey", () => {
  it("completes the unauthenticated dashboard access journey", () => {
    cy.visit("http://localhost:5174/");
    cy.url().should("include", "/login");
    cy.contains("Sign in").should("be.visible");
    cy.contains("Sign in to access the Build Me dashboard.").should("be.visible");
    cy.contains("Continue with Google")
      .should("be.visible")
      .and("not.be.disabled");
  });
});
