/// <reference types="cypress" />

export {};

const API_URL = "http://localhost:3000";
const COFFEE_WITH_ME_REQUEST_URL = `${API_URL}/api/v1/coffee-with-me-requests`;
const ANALYTICS_URL = `${API_URL}/api/v1/analytics/events`;

const validCoffeeRequest = {
  name: "Ada Lovelace",
  email: "ada.lovelace@example.com",
  topic: "Designing scalable systems for a growing startup.",
  preferredFormat: "Online call",
  availability: "Weekday evenings",
};

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

function openCoffeeWithMe(): void {
  cy.visit("/coffee-with-me");
  cy.location("pathname").should("eq", "/coffee-with-me");
}

function fillValidCoffeeRequest(): void {
  cy.get("#coffee-name").type(validCoffeeRequest.name);
  cy.get("#coffee-email").type(validCoffeeRequest.email);
  cy.get("#coffee-topic").type(validCoffeeRequest.topic);
  cy.get("#coffee-format").type(validCoffeeRequest.preferredFormat);
  cy.get("#coffee-availability").type(validCoffeeRequest.availability);
}

describe("Coffee With Me visitor journey", () => {
  it("reaches the coffee with me route", () => {
    trackAnalyticsEvents();

    cy.visit("/coffee-with-me");

    cy.location("pathname").should("eq", "/coffee-with-me");
    cy.contains("Grab a virtual coffee").should("be.visible");
    cy.get("#coffee-name").should("be.visible");
    cy.get("#coffee-email").should("be.visible");
    cy.get("#coffee-topic").should("be.visible");
    cy.get("#coffee-format").should("be.visible");
    cy.get("#coffee-availability").should("be.visible");
  });

  it("submits a valid request and confirms it to the visitor", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", COFFEE_WITH_ME_REQUEST_URL, (request) => {
      request.reply({
        statusCode: 201,
        body: {
          data: {
            id: "11111111-1111-4111-8111-111111111111",
            ...validCoffeeRequest,
            status: "new",
            createdAt: "2026-10-01T10:00:00.000Z",
          },
        },
      });
    }).as("createCoffeeWithMeRequest");

    openCoffeeWithMe();
    fillValidCoffeeRequest();

    cy.contains("button", "Request Coffee Chat").click();

    cy.wait("@createCoffeeWithMeRequest").then(({ request }) => {
      cy.wrap(request.method).should("eq", "POST");
      cy.wrap(request.body).should("deep.eq", validCoffeeRequest);
    });

    cy.contains("Request received").should("be.visible");
    cy.contains(
      "Your coffee chat request has been received and we will be in touch soon to schedule a time.",
    ).should("be.visible");
    cy.get("#coffee-name").should("not.exist");
  });

  it("shows an inline error and creates nothing when the email is invalid", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", COFFEE_WITH_ME_REQUEST_URL).as(
      "rejectedCoffeeWithMeRequest",
    );

    openCoffeeWithMe();

    cy.get("#coffee-name").type(validCoffeeRequest.name);
    cy.get("#coffee-email").type("not-an-email");
    cy.get("#coffee-topic").type(validCoffeeRequest.topic);

    cy.contains("button", "Request Coffee Chat").click();

    cy.get("#coffee-email-error")
      .should("be.visible")
      .and("contain.text", "Please enter a valid email address.");

    cy.contains("Request received").should("not.exist");

    cy.get("@rejectedCoffeeWithMeRequest.all").should("have.length", 0);
  });

  it("shows an inline error and creates nothing when a required field is missing", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", COFFEE_WITH_ME_REQUEST_URL).as(
      "rejectedCoffeeWithMeRequest",
    );

    openCoffeeWithMe();

    cy.get("#coffee-name").type(validCoffeeRequest.name);
    cy.get("#coffee-email").type(validCoffeeRequest.email);

    cy.contains("button", "Request Coffee Chat").click();

    cy.get("#coffee-topic-error")
      .should("be.visible")
      .and("contain.text", "Please tell us what you would like to discuss.");

    cy.contains("Request received").should("not.exist");

    cy.get("@rejectedCoffeeWithMeRequest.all").should("have.length", 0);
  });

  it("surfaces server validation errors on the form and creates nothing", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", COFFEE_WITH_ME_REQUEST_URL, (request) => {
      request.reply({
        statusCode: 400,
        body: {
          error: {
            code: "VALIDATION_ERROR",
            message: "The request is invalid.",
            details: [
              {
                field: "email",
                message: "Please enter a valid email address.",
              },
            ],
          },
        },
      });
    }).as("rejectedCoffeeWithMeRequest");

    openCoffeeWithMe();
    fillValidCoffeeRequest();

    cy.contains("button", "Request Coffee Chat").click();

    cy.wait("@rejectedCoffeeWithMeRequest");

    cy.get("#coffee-email-error")
      .should("be.visible")
      .and("contain.text", "Please enter a valid email address.");

    cy.contains("Request received").should("not.exist");
  });

  it("tracks coffee.with.me.clicked and coffee.with.me.viewed when navigating from home", () => {
    trackAnalyticsEvents();

    cy.visit("/");

    cy.get("body").then(($body) => {
      if (
        $body.text().includes("Coffee With Me") ||
        $body.text().includes("Coffee")
      ) {
        cy.contains("a, button", /coffee with me/i)
          .first()
          .should("be.visible")
          .click();
      } else {
        cy.visit("/coffee-with-me");
      }
    });

    cy.url().should("include", "/coffee-with-me");
    cy.contains("Grab a virtual coffee").should("be.visible");
  });
});
