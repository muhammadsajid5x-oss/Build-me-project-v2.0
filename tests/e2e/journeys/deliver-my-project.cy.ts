/// <reference types="cypress" />

const API_URL = "http://localhost:3000";
const DELIVERY_REQUEST_URL = `${API_URL}/api/v1/delivery-project-requests`;
const ANALYTICS_URL = `${API_URL}/api/v1/analytics/events`;

const validProject = {
  name: "Ada Lovelace",
  email: "ada.lovelace@example.com",
  projectDescription: "Build a delivery dashboard for a fictional programme.",
  expectedOutcome: "A working delivery dashboard that tracks new requests.",
  timeline: "6 weeks",
  budget: "$1,000-$2,000",
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
    request.reply({ statusCode: 202, body: { data: { accepted: true } } });
  }).as("analyticsEvents");
}

function openDeliverMyProject(): void {
  cy.visit("/deliver-my-project");
  cy.location("pathname").should("eq", "/deliver-my-project");
}

function fillValidProject(): void {
  cy.get("#name").type(validProject.name);
  cy.get("#email").type(validProject.email);
  cy.get("#projectDescription").type(validProject.projectDescription);
  cy.get("#expectedOutcome").type(validProject.expectedOutcome);
  cy.get("#timeline").type(validProject.timeline);
  cy.get("#budget").type(validProject.budget);
}

describe("Deliver My Project visitor journey", () => {
  it("reaches the delivery project route", () => {
    trackAnalyticsEvents();
    cy.visit("/deliver-my-project");

    cy.location("pathname").should("eq", "/deliver-my-project");
    cy.contains("h1", "Deliver My Project").should("be.visible");
    cy.get("#name").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#projectDescription").should("be.visible");
    cy.get("#expectedOutcome").should("be.visible");
  });

  it("submits a valid request and confirms it to the visitor", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", DELIVERY_REQUEST_URL, (request) => {
      request.reply({
        statusCode: 201,
        body: {
          data: {
            id: "11111111-1111-4111-8111-111111111111",
            ...validProject,
            status: "new",
            createdAt: "2026-10-01T10:00:00.000Z",
          },
        },
      });
    }).as("createDeliveryProjectRequest");

    openDeliverMyProject();
    fillValidProject();
    cy.contains("button", "Submit Project Request").click();

    cy.wait("@createDeliveryProjectRequest").then(({ request }) => {
      cy.wrap(request.method).should("eq", "POST");
      cy.wrap(request.body).should("deep.eq", validProject);
    });

    cy.contains("h1", "Request received").should("be.visible");
    cy.contains(
      "Your project request has been received and will be reviewed.",
    ).should("be.visible");
    cy.get("#name").should("not.exist");
  });

  it("reports the journey analytics events", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", DELIVERY_REQUEST_URL, {
      statusCode: 201,
      body: { data: { id: "22222222-2222-4222-8222-222222222222" } },
    });

    openDeliverMyProject();
    fillValidProject();
    cy.contains("button", "Submit Project Request").click();

    cy.contains("h1", "Request received").should("be.visible");
  });
});

describe("Deliver My Project validation", () => {
  it("shows an inline error and creates nothing when the email is invalid", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", DELIVERY_REQUEST_URL).as(
      "rejectedDeliveryProjectRequest",
    );

    openDeliverMyProject();

    cy.get("#name").type(validProject.name);
    cy.get("#email").type("not-an-email");
    cy.get("#projectDescription").type(validProject.projectDescription);
    cy.get("#expectedOutcome").type(validProject.expectedOutcome);

    cy.contains("button", "Submit Project Request").click();

    cy.get("#email-error")
      .should("be.visible")
      .and("contain.text", "Please enter a valid email address.");
    cy.contains("h1", "Request received").should("not.exist");

    cy.get("@rejectedDeliveryProjectRequest.all").should("have.length", 0);
  });

  it("shows an inline error and creates nothing when a required field is missing", () => {
    cy.intercept("POST", DELIVERY_REQUEST_URL).as(
      "rejectedDeliveryProjectRequest",
    );

    openDeliverMyProject();

    cy.get("#name").type(validProject.name);
    cy.get("#email").type(validProject.email);
    cy.get("#projectDescription").type(validProject.projectDescription);

    cy.contains("button", "Submit Project Request").click();

    cy.get("#expected-outcome-error")
      .should("be.visible")
      .and("contain.text", "Expected outcome is required.");
    cy.contains("h1", "Request received").should("not.exist");

    cy.get("@rejectedDeliveryProjectRequest.all").should("have.length", 0);
  });

  it("surfaces server validation errors on the form and creates nothing", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", DELIVERY_REQUEST_URL, (request) => {
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
    }).as("rejectedDeliveryProjectRequest");

    openDeliverMyProject();
    fillValidProject();
    cy.contains("button", "Submit Project Request").click();

    cy.wait("@rejectedDeliveryProjectRequest");

    cy.get("#email-error")
      .should("be.visible")
      .and("contain.text", "Please enter a valid email address.");
    cy.contains("h1", "Request received").should("not.exist");
  });
});
