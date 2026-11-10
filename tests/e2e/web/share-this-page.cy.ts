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

  it("opens a channel share URL with safe window features", () => {
    cy.window().then((win) => {
      cy.stub(win, "open").as("shareWindow");
    });

    cy.get('button[aria-label="Share this page"]').click();
    cy.get("dialog").getByRole("button", { name: "Facebook" }).click();

    cy.get("@shareWindow").should("have.been.calledOnce");

    cy.get("@shareWindow").then((stub) => {
      const [url, target, features] = (stub as unknown as {
        args: [string, string, string][];
      }).args[0];

      expect(url).to.contain("https://www.facebook.com/sharer/sharer.php");
      expect(url).to.contain(encodeURIComponent(Cypress.config("baseUrl") ?? ""));
      expect(target).to.equal("_blank");
      expect(features).to.contain("noopener");
      expect(features).to.contain("noreferrer");
    });
  });

  it("copies the current page URL", () => {
    cy.window().then((win) => {
      Object.defineProperty(win.navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: cy.stub().as("writeText"),
        },
      });
    });

    cy.get('button[aria-label="Share this page"]').click();
    cy.get("dialog").getByRole("button", { name: "Copy Link" }).click();

    cy.get("@writeText").should("have.been.calledWith", Cypress.config("baseUrl") + "/");
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
