/// <reference types="cypress" />

describe("Follow Us", () => {
  it("displays all social connections", () => {
    cy.visit("/");

    cy.contains("Follow Us").should("be.visible");

    cy.get('a[aria-label="Connect with me on LinkedIn"]').should(
      "have.attr",
      "href",
      "https://www.linkedin.com/in/muhammad-sajid-softwaredeveloper/",
    );

    cy.get('a[aria-label="Connect with me on Facebook"]').should(
      "have.attr",
      "href",
      "https://web.facebook.com/rao.sajid.1232",
    );

    cy.get('a[aria-label="Visit my YouTube channel"]').should(
      "have.attr",
      "href",
      "https://www.youtube.com/channel/UCX80pgVBcXTgawdM3hAQzBg",
    );

    cy.get('a[aria-label="Contact me on WhatsApp"]').should(
      "have.attr",
      "href",
      "https://wa.me/923009164602",
    );

    cy.get('a[aria-label="Contact me on Telegram"]').should(
      "have.attr",
      "href",
      "https://t.me/+923009164602",
    );
  });
});
