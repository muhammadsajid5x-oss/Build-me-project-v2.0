/// <reference types="cypress" />

describe("Build Me Web", () => {
  it("loads the homepage", () => {
    cy.visit("/");

    cy.contains("TECHNOLOGY OWNERSHIP").should("be.visible");
    cy.contains("Build Better").should("be.visible");
    cy.contains("Digital Experiences").should("be.visible");
  });
});
