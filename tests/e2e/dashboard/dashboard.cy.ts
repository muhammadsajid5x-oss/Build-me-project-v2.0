/// <reference types="cypress" />

describe("Build Me Dashboard", () => {
  it("loads the dashboard route for unauthenticated users", () => {
    cy.visit("/dashboard");
    cy.url().should("include", "/dashboard");
    cy.get("body").should("be.visible");
  });
});
