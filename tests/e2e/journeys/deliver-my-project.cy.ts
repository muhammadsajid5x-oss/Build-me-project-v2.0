/// <reference types="cypress" />

/**
 * Child Story 4 - "Work With Me" -> "Deliver My Project".
 *
 * Covers the visitor journey end to end:
 * homepage -> Work With Me CTA -> Deliver My Project -> form -> confirmation.
 *
 * The API is stubbed with cy.intercept so the journey itself is verified
 * deterministically on every environment. The request payload that the browser
 * sends is asserted, so the contract with the real API is still covered.
 *
 * The real API contract (creation, validation and admin protection) is
 * covered by the API suites under tests/api.
 */

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

/**
 * The analytics events the journey reports, in the order the visitor walks
 * through them.
 */
const journeyAnalyticsEvents = [
  "work.with.me.clicked",
  "deliver.my.project.clicked",
  "deliver.my.project.viewed",
  "deliver.my.project.completed",
];

/**
 * Reads the event name from an intercepted analytics request.
 *
 * The web app reports analytics with `URLSearchParams`, so the request body
 * arrives form encoded. Cypress exposes it as an object for some content
 * types and as the raw string for others, so both are handled here.
 */
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

/**
 * Records the analytics events the page reports while the journey runs.
 * The page reports events with fetch and keepalive, so they are captured
 * through an intercept rather than by observing the DOM.
 */
function trackAnalyticsEvents(): string[] {
  const events: string[] = [];

  cy.intercept("POST", ANALYTICS_URL, (request) => {
    const name = readEventName(request.body);

    if (name) {
      events.push(name);
    }

    request.reply({ statusCode: 202, body: { data: { accepted: true } } });
  }).as("analyticsEvents");

  return events;
}

/**
 * Opens the "Deliver My Project" route from the homepage through the
 * "Work With Me" call to action, exactly as a visitor would.
 */
function openDeliverMyProject(): void {
  cy.visit("/");
  cy.contains("button", "Work With Me").click();
  cy.contains("a", "Deliver My Project").click();
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
  it("reaches the delivery project route from the homepage CTA", () => {
    trackAnalyticsEvents();

    cy.visit("/");

    cy.contains("button", "Work With Me").should("be.visible").click();

    cy.get('[role="dialog"]').should("be.visible");
    cy.contains("How would you like to work together?").should("be.visible");
    cy.contains("a", "Deliver My Project").should("be.visible").click();

    cy.location("pathname").should("eq", "/deliver-my-project");
    cy.contains("h1", "Deliver My Project").should("be.visible");
    cy.get("#name").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#projectDescription").should("be.visible");
    cy.get("#expectedOutcome").should("be.visible");
  });

  it("submits a valid request and confirms it to the visitor", () => {
    const analyticsEvents = trackAnalyticsEvents();

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

    cy.wrap(analyticsEvents).should("include", "deliver.my.project.completed");
  });

  it("reports the journey analytics events", () => {
    const analyticsEvents = trackAnalyticsEvents();

    cy.intercept("POST", DELIVERY_REQUEST_URL, {
      statusCode: 201,
      body: { data: { id: "22222222-2222-4222-8222-222222222222" } },
    });

    openDeliverMyProject();
    fillValidProject();
    cy.contains("button", "Submit Project Request").click();

    cy.contains("h1", "Request received").should("be.visible");

    // The analytics events are reported while the visitor walks the journey,
    // so the assertion is retryable and waits for every event to arrive
    // before it compares the order they were reported in.
    cy.wrap(analyticsEvents).should((events: string[]) => {
      const reported = events.filter(
        (event, index) =>
          journeyAnalyticsEvents.includes(event) &&
          events.indexOf(event) === index,
      );

      if (reported.join("|") !== journeyAnalyticsEvents.join("|")) {
        throw new Error(
          `Expected the analytics events "${journeyAnalyticsEvents.join(
            ", ",
          )}" to be reported in that order, but received "${
            reported.join(", ") || "none"
          }".`,
        );
      }
    });
  });
});

describe("Deliver My Project validation", () => {
  it("shows an inline error and creates nothing when the email is invalid", () => {
    const analyticsEvents = trackAnalyticsEvents();

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

    // The visitor is told what is wrong before anything is sent, so no
    // request is created.
    cy.get("@rejectedDeliveryProjectRequest.all").should("have.length", 0);
    cy.wrap(analyticsEvents).should(
      "not.include",
      "deliver.my.project.completed",
    );
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
    const analyticsEvents = trackAnalyticsEvents();

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

    cy.contains("Please review the highlighted fields and try again.").should(
      "be.visible",
    );
    cy.get("#email-error")
      .should("be.visible")
      .and("contain.text", "Please enter a valid email address.");
    cy.contains("h1", "Request received").should("not.exist");

    cy.wrap(analyticsEvents).should(
      "not.include",
      "deliver.my.project.completed",
    );
  });
});
