/// <reference types="cypress" />
export {};

const API_URL = "http://localhost:3000";
const OWNERSHIP_AUDIT_URL = `${API_URL}/api/v1/ownership-audits`;
const ANALYTICS_URL = `${API_URL}/api/v1/analytics/events`;

function readEventName(body: unknown): string | null {
  if (typeof body === "string") {
    return new URLSearchParams(body).get("name");
  }

  if (body && typeof body === "object") {
    const name = (body as { name?: unknown }).name;
    return typeof name === "string" ? name : null;
  }

  return null;
}

function trackAnalyticsEvents(): void {
  cy.intercept("POST", ANALYTICS_URL, (request) => {
    readEventName(request.body);

    request.reply({
      statusCode: 202,
      body: { data: { accepted: true } },
    });
  }).as("analyticsEvents");
}

function openOwnershipAudit(): void {
  cy.visit("/");

  cy.contains("button", "Work With Me").should("be.visible").click();

  cy.contains("h2", "How would you like to work together?").should(
    "be.visible",
  );

  cy.contains("button", "Ownership Audit").should("be.visible").click();

  cy.contains("h2", "Ownership Audit").should("be.visible");
}
function selectAnswer(value: "A" | "B" | "C") {
  cy.get(`input[value="${value}"]`).first().check({ force: true });
}

function clickNext() {
  cy.contains("button", "Next").should("be.visible").click();
}

function completeAudit() {
  cy.contains("button", "Complete Audit").should("be.visible").click();
}

describe("Ownership Audit visitor journey", () => {
  it("renders the Ownership Audit from Home page", () => {
    trackAnalyticsEvents();

    openOwnershipAudit();

    cy.contains(
      "What stage is your current technology initiative or software project in right now?",
    ).should("be.visible");
  });

  it("answers Q1 and navigates to Q2", () => {
    trackAnalyticsEvents();

    openOwnershipAudit();

    selectAnswer("C");
    clickNext();

    cy.contains("h3", "Tech Stack & Architecture").should("be.visible");
  });

  it("answers Q2 and navigates to Q3", () => {
    trackAnalyticsEvents();

    openOwnershipAudit();

    selectAnswer("C");
    clickNext();

    selectAnswer("C");
    clickNext();

    cy.contains("h3", "Primary Bottleneck / Pain Point").should("be.visible");
  });

  it("completes the audit with C/C/C and shows result", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", OWNERSHIP_AUDIT_URL, {
      statusCode: 201,
      body: {
        data: {
          score: 15,
          category: "Strong Ownership",
        },
      },
    }).as("createOwnershipAudit");

    openOwnershipAudit();

    selectAnswer("C");
    clickNext();

    selectAnswer("C");
    clickNext();

    selectAnswer("C");
    completeAudit();

    cy.wait("@createOwnershipAudit").its("request.body").should("deep.equal", {
      step1: "C",
      step2: "C",
      step3: "C",
    });

    cy.contains("Optimized & Secure").should("be.visible");

    cy.contains("Strong Ownership").should("be.visible");

    cy.contains("15 / 15").should("be.visible");
  });

  it("shows validation message when attempting to continue without answer", () => {
    trackAnalyticsEvents();

    openOwnershipAudit();

    clickNext();

    cy.contains("Please select an answer before continuing.").should(
      "be.visible",
    );
  });

  it("shows validation message when completing without all answers", () => {
    trackAnalyticsEvents();

    openOwnershipAudit();

    selectAnswer("C");
    clickNext();

    selectAnswer("C");
    clickNext();

    completeAudit();

    cy.contains("Please select an answer before completing.").should(
      "be.visible",
    );
  });
});
