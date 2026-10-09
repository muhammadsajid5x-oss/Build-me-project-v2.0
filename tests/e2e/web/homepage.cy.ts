/// <reference types="cypress" />
describe("Build Me Web", () => {
  it("loads the homepage", () => {
    cy.visit("/");
    cy.contains("Build Me").should("be.visible");
    cy.contains("Public website foundation.").should("be.visible");
  });
});
