/// <reference types="cypress" />

describe("About visitor journey", () => {
  it("opens About Us from the footer", () => {
    cy.visit("/");

    cy.get('a[href="/about"]').last().click();

    cy.location("pathname").should("eq", "/about");
    cy.contains("About Us").should("be.visible");
  });
});
