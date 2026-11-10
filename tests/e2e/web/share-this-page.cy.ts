/// <reference types="cypress" />

describe("Share This Page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("displays the Share This Page section", () => {
    cy.contains("Share This Page").should("be.visible");

    cy.get('button[aria-label="Share this page"]').should("be.visible");
  });

  it("opens the share dialog with all supported channels", () => {
    cy.get('button[aria-label="Share this page"]').click();

    cy.get("dialog")
      .should("be.visible")
      .and("contain", "Share Cup&Cummit with your network");

    cy.get("dialog").within(() => {
      cy.contains("Facebook").should("be.visible");
      cy.contains("Instagram").should("be.visible");
      cy.contains("Twitter").should("be.visible");
      cy.contains("LinkedIn").should("be.visible");
      cy.contains("Pinterest").should("be.visible");
      cy.contains("TikTok").should("be.visible");
      cy.contains("Telegram").should("be.visible");
      cy.contains("WhatsApp").should("be.visible");
      cy.contains("YouTube").should("be.visible");
      cy.contains("Snapchat").should("be.visible");
      cy.contains("Email").should("be.visible");
      cy.contains("Copy Link").should("be.visible");
    });
  });

  it("closes the share dialog with the close button", () => {
    cy.get('button[aria-label="Share this page"]').click();

    cy.get("dialog").should("be.visible");

    cy.get('button[aria-label="Close share dialog"]').click();

    cy.get("dialog").should("not.exist");
  });

  it("closes the share dialog with Escape", () => {
    cy.get('button[aria-label="Share this page"]').click();

    cy.get("dialog").should("be.visible");

    cy.get("body").type("{esc}");

    cy.get("dialog").should("not.exist");
  });
});
