/// <reference types="cypress" />

describe("Build Me Web Application", () => {
  it("loads the homepage successfully", () => {
    cy.visit("/");

    cy.contains("Build Me").should("be.visible");
    cy.contains("Public website foundation.").should("be.visible");
  });
});
