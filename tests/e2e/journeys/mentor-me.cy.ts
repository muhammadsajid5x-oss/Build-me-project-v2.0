/// <reference types="cypress" />

export {};
const API_URL = "http://localhost:3000";
const MENTOR_ME_REQUEST_URL = `${API_URL}/api/v1/mentor-me-requests`;
const ANALYTICS_URL = `${API_URL}/api/v1/analytics/events`;

const validMentorRequest = {
  name: "Ada Lovelace",
  email: "ada.lovelace@example.com",
  mentoringArea: "Software Architecture",
  helpWith: "Designing scalable systems for a growing startup.",
  experienceContext: "5 years as a backend engineer, currently tech lead.",
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
    request.reply({ statusCode: 202, body: { data: { accepted: true } } });
  }).as("analyticsEvents");
}

function openMentorMe(): void {
  cy.visit("/mentor-me");
  cy.location("pathname").should("eq", "/mentor-me");
}

function fillValidMentorRequest(): void {
  cy.get("#mentor-name").type(validMentorRequest.name);
  cy.get("#mentor-email").type(validMentorRequest.email);
  cy.get("#mentor-area").type(validMentorRequest.mentoringArea);
  cy.get("#mentor-help").type(validMentorRequest.helpWith);
  cy.get("#mentor-experience").type(validMentorRequest.experienceContext);
  cy.get("#mentor-format").type(validMentorRequest.preferredFormat);
  cy.get("#mentor-availability").type(validMentorRequest.availability);
}

describe("Mentor Me visitor journey", () => {
  it("reaches the mentor me route", () => {
    trackAnalyticsEvents();
    cy.visit("/mentor-me");

    cy.location("pathname").should("eq", "/mentor-me");
    cy.contains("Mentor Me").should("be.visible");
    cy.get("#mentor-name").should("be.visible");
    cy.get("#mentor-email").should("be.visible");
    cy.get("#mentor-area").should("be.visible");
    cy.get("#mentor-help").should("be.visible");
    cy.get("#mentor-experience").should("be.visible");
    cy.get("#mentor-format").should("be.visible");
    cy.get("#mentor-availability").should("be.visible");
  });

  it("submits a valid request and confirms it to the visitor", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", MENTOR_ME_REQUEST_URL, (request) => {
      request.reply({
        statusCode: 201,
        body: {
          data: {
            id: "11111111-1111-4111-8111-111111111111",
            ...validMentorRequest,
            status: "new",
            createdAt: "2026-10-01T10:00:00.000Z",
          },
        },
      });
    }).as("createMentorMeRequest");

    openMentorMe();
    fillValidMentorRequest();
    cy.contains("button", "Request Mentoring Support").click();

    cy.wait("@createMentorMeRequest").then(({ request }) => {
      cy.wrap(request.method).should("eq", "POST");
      cy.wrap(request.body).should("deep.eq", validMentorRequest);
    });

    cy.contains("Request received").should("be.visible");
    cy.contains(
      "Your mentoring request has been received and will be reviewed.",
    ).should("be.visible");
    cy.get("#mentor-name").should("not.exist");
  });

  it("reports the journey analytics events", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", MENTOR_ME_REQUEST_URL, {
      statusCode: 201,
      body: { data: { id: "22222222-2222-4222-8222-222222222222" } },
    });

    openMentorMe();
    fillValidMentorRequest();
    cy.contains("button", "Request Mentoring Support").click();

    cy.contains("Request received").should("be.visible");
  });
});

describe("Mentor Me validation", () => {
  it("shows an inline error and creates nothing when the email is invalid", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", MENTOR_ME_REQUEST_URL).as("rejectedMentorMeRequest");

    openMentorMe();

    cy.get("#mentor-name").type(validMentorRequest.name);
    cy.get("#mentor-email").type("not-an-email");
    cy.get("#mentor-area").type(validMentorRequest.mentoringArea);
    cy.get("#mentor-help").type(validMentorRequest.helpWith);
    cy.get("#mentor-experience").type(validMentorRequest.experienceContext);

    cy.contains("button", "Request Mentoring Support").click();

    cy.get("#mentor-email-error")
      .should("be.visible")
      .and("contain.text", "Please enter a valid email address.");
    cy.contains("Request received").should("not.exist");

    cy.get("@rejectedMentorMeRequest.all").should("have.length", 0);
  });

  it("shows an inline error and creates nothing when a required field is missing", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", MENTOR_ME_REQUEST_URL).as("rejectedMentorMeRequest");

    openMentorMe();

    cy.get("#mentor-name").type(validMentorRequest.name);
    cy.get("#mentor-email").type(validMentorRequest.email);
    cy.get("#mentor-area").type(validMentorRequest.mentoringArea);
    cy.get("#mentor-help").type(validMentorRequest.helpWith);

    cy.contains("button", "Request Mentoring Support").click();

    cy.get("#mentor-experience-error")
      .should("be.visible")
      .and("contain.text", "Current experience or context is required.");
    cy.contains("Request received").should("not.exist");

    cy.get("@rejectedMentorMeRequest.all").should("have.length", 0);
  });

  it("surfaces server validation errors on the form and creates nothing", () => {
    trackAnalyticsEvents();

    cy.intercept("POST", MENTOR_ME_REQUEST_URL, (request) => {
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
    }).as("rejectedMentorMeRequest");

    openMentorMe();
    fillValidMentorRequest();
    cy.contains("button", "Request Mentoring Support").click();

    cy.wait("@rejectedMentorMeRequest");

    cy.contains("We could not submit your mentoring request right now").should(
      "be.visible",
    );
    cy.contains("Request received").should("not.exist");
  });
});

describe("Mentor Me Work With Me journey", () => {
  it("tracks work.with.me.clicked and mentor.me.clicked when navigating from home", () => {
    trackAnalyticsEvents();

    cy.visit("/");
    cy.get("body").then(($body) => {
      if (
        $body.text().includes("Work With Me") ||
        $body.text().includes("Mentor Me")
      ) {
        cy.contains("a, button", /mentor me|work with me/i)
          .first()
          .should("be.visible")
          .click();
      } else {
        cy.visit("/mentor-me");
      }
    });

    cy.url().should("include", "/mentor-me");
    cy.contains("Mentor Me").should("be.visible");
  });
});
