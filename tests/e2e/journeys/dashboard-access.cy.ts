/// <reference types="cypress" />

describe("Build Me User Journey", () => {
  it("completes the unauthenticated dashboard access journey", () => {
    cy.visit("/dashboard");
    cy.url().should("include", "/dashboard");
    cy.get("body").should("be.visible");
  });
});
