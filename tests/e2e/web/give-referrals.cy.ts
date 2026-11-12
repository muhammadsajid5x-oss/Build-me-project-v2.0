/// <reference types="cypress" />

describe("Give Referrals", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("displays the Give Referrals CTA", () => {
    cy.contains("Give Referrals").should("be.visible");

    cy.get('button[aria-label="Give Referrals"]')
      .should("be.visible")
      .and("have.attr", "aria-haspopup", "dialog");
  });

  it("opens the referral dialog at step one", () => {
    cy.get('button[aria-label="Give Referrals"]').click();

    cy.get("dialog")
      .should("be.visible")
      .and("contain", "Give Referrals")
      .and("contain", "Your Information");

    cy.contains("Your Name").should("be.visible");
    cy.contains("Your Email").should("be.visible");
    cy.contains("Continue").should("be.visible");
  });

  it("validates step one before continuing", () => {
    cy.get('button[aria-label="Give Referrals"]').click();

    cy.contains("Continue").click();

    cy.get('[role="alert"]')
      .should("be.visible")
      .and("contain", "Please enter your name.");

    cy.get('input[type="text"]').first().type("Muhammad Sajid");
    cy.get('input[type="email"]').first().type("invalid-email");

    cy.contains("Continue").click();

    cy.get('[role="alert"]')
      .should("be.visible")
      .and("contain", "Please enter a valid email address.");
  });

  it("completes all three referral steps and shows confirmation", () => {
    cy.get('button[aria-label="Give Referrals"]').click();

    // Step 1
    cy.get('input[type="text"]').first().type("Muhammad Sajid");
    cy.get('input[type="email"]').first().type("sajid@example.com");

    cy.contains("Continue").click();

    cy.contains("Friend, Family, or Colleague").should("be.visible");

    // Step 2
    cy.get('input[type="text"]').first().type("Ahmed Khan");
    cy.get('input[type="email"]').first().type("ahmed@example.com");
    cy.get("select").select("friend");

    cy.contains("Continue").click();

    cy.contains("Confirmation").should("be.visible");
    cy.contains("Ahmed Khan").should("be.visible");
    cy.contains("friend").should("be.visible");

    // Step 3
    cy.get("textarea").type(
      "I believe this person would benefit from your technology services.",
    );

    cy.contains("Submit Referral").click();

    cy.contains("Referral Submitted").should("be.visible");
    cy.contains(
      "Your referral details have been submitted successfully.",
    ).should("be.visible");

    cy.contains("Done").should("be.visible");
  });

  it("validates step two fields", () => {
    cy.get('button[aria-label="Give Referrals"]').click();

    cy.get('input[type="text"]').first().type("Muhammad Sajid");
    cy.get('input[type="email"]').first().type("sajid@example.com");

    cy.contains("Continue").click();

    cy.contains("Continue").click();

    cy.get('[role="alert"]')
      .should("be.visible")
      .and(
        "contain",
        "Please enter your friend's, family member's, or colleague's name.",
      );
  });

  it("requires a relationship on step two", () => {
    cy.get('button[aria-label="Give Referrals"]').click();

    cy.get('input[type="text"]').first().type("Muhammad Sajid");
    cy.get('input[type="email"]').first().type("sajid@example.com");
    cy.contains("Continue").click();

    cy.get('input[type="text"]').first().type("Ahmed Khan");
    cy.get('input[type="email"]').first().type("ahmed@example.com");

    cy.contains("Continue").click();

    cy.get('[role="alert"]')
      .should("be.visible")
      .and("contain", "Please select your relationship.");
  });

  it("requires a reason before submitting step three", () => {
    cy.get('button[aria-label="Give Referrals"]').click();

    cy.get('input[type="text"]').first().type("Muhammad Sajid");
    cy.get('input[type="email"]').first().type("sajid@example.com");
    cy.contains("Continue").click();

    cy.get('input[type="text"]').first().type("Ahmed Khan");
    cy.get('input[type="email"]').first().type("ahmed@example.com");
    cy.get("select").select("colleague");
    cy.contains("Continue").click();

    cy.contains("Submit Referral").click();

    cy.get('[role="alert"]')
      .should("be.visible")
      .and("contain", "Please tell us why you are making this referral.");
  });

  it("supports navigating back between steps", () => {
    cy.get('button[aria-label="Give Referrals"]').click();

    cy.get('input[type="text"]').first().type("Muhammad Sajid");
    cy.get('input[type="email"]').first().type("sajid@example.com");

    cy.contains("Continue").click();

    cy.contains("Friend, Family, or Colleague").should("be.visible");

    cy.contains("Back").click();

    cy.contains("Your Information").should("be.visible");

    cy.contains("Continue").click();

    cy.get('input[type="text"]').first().type("Ahmed Khan");
    cy.get('input[type="email"]').first().type("ahmed@example.com");
    cy.get("select").select("family");

    cy.contains("Continue").click();

    cy.contains("Confirmation").should("be.visible");

    cy.contains("Back").click();

    cy.contains("Friend, Family, or Colleague").should("be.visible");
  });

  it("closes the referral dialog with the close button", () => {
    cy.get('button[aria-label="Give Referrals"]').click();

    cy.get("dialog").should("be.visible");

    cy.get('button[aria-label="Close referral dialog"]').click();

    cy.get("dialog").should("not.exist");
  });

  it("closes the referral dialog with Escape", () => {
    cy.get('button[aria-label="Give Referrals"]').click();

    cy.get("dialog").should("be.visible");

    cy.get("body").type("{esc}");

    cy.get("dialog").should("not.exist");
  });

  it("closes the confirmation screen with Done", () => {
    cy.get('button[aria-label="Give Referrals"]').click();

    cy.get('input[type="text"]').first().type("Muhammad Sajid");
    cy.get('input[type="email"]').first().type("sajid@example.com");
    cy.contains("Continue").click();

    cy.get('input[type="text"]').first().type("Ahmed Khan");
    cy.get('input[type="email"]').first().type("ahmed@example.com");
    cy.get("select").select("friend");
    cy.contains("Continue").click();

    cy.get("textarea").type("This person would benefit from the service.");
    cy.contains("Submit Referral").click();

    cy.contains("Referral Submitted").should("be.visible");

    cy.contains("Done").click();

    cy.get("dialog").should("not.exist");
  });
});
