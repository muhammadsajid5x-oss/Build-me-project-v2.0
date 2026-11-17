/// <reference types="cypress" />

describe("Give Feedback", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("shows the Give Feedback button", () => {
    cy.contains("Give Feedback").should("be.visible");
  });

  it("opens the feedback modal at step one", () => {
    cy.contains("Give Feedback").click();

    cy.get("dialog").should("be.visible").and("contain", "Give Feedback");

    cy.contains("Score Us").should("be.visible");
    cy.contains("Rate Us").should("be.visible");
    cy.contains("Report Issues").should("be.visible");
    cy.contains("Suggest Something").should("be.visible");
  });

  it("moves from step one to the Score Us form", () => {
    cy.contains("Give Feedback").click();

    cy.contains("Score Us").click();

    cy.contains("Back").should("be.visible");
    cy.contains("Additional Comments").should("be.visible");
    cy.contains("Preview & Submit").should("be.visible");

    cy.get('input[type="radio"], button').should("exist");
  });
});
