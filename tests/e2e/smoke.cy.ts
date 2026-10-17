/// <reference types="cypress" />

describe("Build Me Web Application", () => {
  it("loads the homepage successfully", () => {
    cy.visit("/");

    cy.contains("TECHNOLOGY OWNERSHIP").should("be.visible");
    cy.contains("Build Better").should("be.visible");
    cy.contains("Digital Experiences").should("be.visible");
  });
});
