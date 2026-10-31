/// <reference types="cypress" />
export {};

const API_URL = "http://localhost:3000";
const OWNERSHIP_AUDIT_URL = `${API_URL}/api/v1/ownership-audits`;
const ANALYTICS_URL = `${API_URL}/api/v1/analytics/events`;

function readEventName(body: unknown): string | null {
  if (typeof body === "string") return new URLSearchParams(body).get("name");
  if (body && typeof body === "object") {
    const name = (body as { name?: unknown }).name;
    return typeof name === "string" ? name : null;
  }
  return null;
}

function trackAnalyticsEvents(): void {
  cy.intercept("POST", ANALYTICS_URL, (request) => {
    request.reply({ statusCode: 202, body: { data: { accepted: true } } });
  }).as("analyticsEvents");
}

function openOwnershipAudit(): void {
  cy.visit("/");
  cy.contains("button", "Work With Me").should("be.visible").click();
  cy.contains("button", "Ownership Audit").should("be.visible").click();
  cy.contains("h3", "Technology Ownership Audit").should("be.visible");
}

function startQuestions(): void {
  cy.contains("button", "Start Ownership Audit").click();
  cy.get('input[autocomplete="name"]').type("Cypress Visitor");
  cy.get('input[autocomplete="email"]').type("cypress@example.com");
  cy.contains("button", "Begin Questions").click();
}

function answerBothC(): void {
  cy.get('input[type="radio"][value="C"]').each(($radio) => {
    cy.wrap($radio).check({ force: true });
  });
}

function answerAllC(): void {
  for (let page = 0; page < 5; page += 1) {
    answerBothC();
    if (page < 4) cy.contains("button", "Next").click();
  }
}

describe("Ownership Audit visitor journey", () => {
  it("opens the audit from Work With Me and shows the About screen", () => {
    trackAnalyticsEvents();
    openOwnershipAudit();
    cy.contains("About the Audit").should("be.visible");
    cy.contains("10 questions").should("be.visible");
  });

  it("requires full name and email before starting", () => {
    openOwnershipAudit();
    cy.contains("button", "Start Ownership Audit").click();
    cy.contains("button", "Begin Questions").click();
    cy.contains("Please enter your full name.").should("be.visible");
  });

  it("starts the five two-question screens after valid visitor details", () => {
    openOwnershipAudit();
    startQuestions();

    cy.contains("Audit Questions (1 of 5)").should("be.visible");
    answerBothC();
    cy.contains("button", "Next").click();
    cy.contains("Audit Questions (2 of 5)").should("be.visible");
  });

  it("completes all ten questions and renders score, results and analytics", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", OWNERSHIP_AUDIT_URL, {
      statusCode: 201,
      body: {
        data: {
          id: "audit-e2e",
          fullName: "Cypress Visitor",
          visitorEmail: "cypress@example.com",
          score: 100,
          category: "Strong Ownership",
          diagnosticResult: "Highly mature, automated, and secure architecture.",
          redirectTarget: "Coffee With Me",
          createdAt: "2026-11-01T00:00:00.000Z",
        },
      },
    }).as("createOwnershipAudit");

    openOwnershipAudit();
    startQuestions();
    answerAllC();

    cy.contains("button", "Calculate Score").click();
    cy.wait("@createOwnershipAudit").its("request.body").should("deep.include", {
      fullName: "Cypress Visitor",
      visitorEmail: "cypress@example.com",
      q1: "C",
      q10: "C",
    });

    cy.contains("100").should("be.visible");
    cy.contains("button", "View Results").click();
    cy.contains("Strong Ownership").should("be.visible");
    cy.contains("Coffee With Me").should("be.visible");

    cy.contains("button", "Continue").click();
    cy.contains("Analytics Recorded").should("be.visible");
  });

  it("does not complete when a question pair is unanswered", () => {
    openOwnershipAudit();
    startQuestions();
    cy.contains("button", "Next").click();
    cy.contains("Please answer both questions before continuing.").should("be.visible");
  });
});
