/// <reference types="cypress" />

const testimonialsPageOne = {
  data: [
    {
      id: "testimonial-1",
      name: "Ayesha Khan",
      role: "Product Manager",
      company: "Tech Company",
      avatar: null,
      category: "Technology",
      content: "Excellent collaboration and strong technical delivery.",
      rating: 5,
      helpfulCount: 3,
      storyUrl: null,
      verified: true,
      published: true,
      createdAt: "2026-10-01T00:00:00.000Z",
    },
    {
      id: "testimonial-2",
      name: "Bilal Ahmed",
      role: "Founder",
      company: "Startup",
      avatar: null,
      category: "Technology",
      content: "Professional, reliable, and technically strong.",
      rating: 5,
      helpfulCount: 2,
      storyUrl: null,
      verified: true,
      published: true,
      createdAt: "2026-10-02T00:00:00.000Z",
    },
    {
      id: "testimonial-3",
      name: "Sarah Malik",
      role: "Engineering Lead",
      company: "Digital Agency",
      avatar: null,
      category: "Technology",
      content: "Clear communication and dependable engineering execution.",
      rating: 5,
      helpfulCount: 4,
      storyUrl: null,
      verified: true,
      published: true,
      createdAt: "2026-10-03T00:00:00.000Z",
    },
    {
      id: "testimonial-4",
      name: "Usman Raza",
      role: "Founder",
      company: "Product Company",
      avatar: null,
      category: "Technology",
      content: "Strong technical ownership from planning through delivery.",
      rating: 5,
      helpfulCount: 1,
      storyUrl: null,
      verified: true,
      published: true,
      createdAt: "2026-10-04T00:00:00.000Z",
    },
  ],
  pagination: {
    page: 1,
    limit: 4,
    total: 6,
    totalPages: 2,
  },
};

const testimonialsPageTwo = {
  data: [
    {
      id: "testimonial-5",
      name: "Hassan Ali",
      role: "Product Owner",
      company: "Technology Company",
      avatar: null,
      category: "Technology",
      content: "Reliable delivery with excellent attention to detail.",
      rating: 5,
      helpfulCount: 2,
      storyUrl: null,
      verified: true,
      published: true,
      createdAt: "2026-10-05T00:00:00.000Z",
    },
    {
      id: "testimonial-6",
      name: "Maria Iqbal",
      role: "Project Manager",
      company: "Digital Business",
      avatar: null,
      category: "Technology",
      content: "Professional execution and a strong focus on outcomes.",
      rating: 5,
      helpfulCount: 3,
      storyUrl: null,
      verified: true,
      published: true,
      createdAt: "2026-10-06T00:00:00.000Z",
    },
  ],
  pagination: {
    page: 2,
    limit: 4,
    total: 6,
    totalPages: 2,
  },
};

describe("Testimonials", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/v1/testimonials?page=1&limit=4", {
      statusCode: 200,
      body: testimonialsPageOne,
    }).as("getTestimonialsPageOne");

    cy.intercept("GET", "**/api/v1/testimonials?page=2&limit=4", {
      statusCode: 200,
      body: testimonialsPageTwo,
    }).as("getTestimonialsPageTwo");

    cy.intercept("POST", "**/api/v1/testimonials/*/helpful", (request) => {
      request.reply({
        statusCode: 200,
        body: {
          data: {
            testimonialId: "testimonial-1",
            helpfulCount: 4,
          },
        },
      });
    }).as("markHelpful");

    cy.visit("/");

    cy.get('section[aria-labelledby="testimonials-heading"]', {
      timeout: 10000,
    }).should("exist");

    cy.wait("@getTestimonialsPageOne");
  });

  it("displays the testimonials section and four testimonial cards", () => {
    cy.get('section[aria-labelledby="testimonials-heading"]')
      .should("be.visible")
      .within(() => {
        cy.get("article").should("have.length", 4);
        cy.get("blockquote").should("have.length", 4);
      });
  });

  it("supports testimonial pagination", () => {
    cy.get('nav[aria-label="Testimonials pagination"]')
      .should("be.visible")
      .within(() => {
        cy.contains("Page 1 of 2").should("be.visible");

        cy.contains("button", "Previous").should("be.disabled");

        cy.contains("button", "Next").should("be.enabled").click();
      });

    cy.wait("@getTestimonialsPageTwo");

    cy.get('nav[aria-label="Testimonials pagination"]')
      .should("be.visible")
      .within(() => {
        cy.contains("Page 2 of 2").should("be.visible");

        cy.contains("button", "Next").should("be.disabled");

        cy.contains("button", "Previous").should("be.enabled").click();
      });

    cy.get('nav[aria-label="Testimonials pagination"]')
      .should("be.visible")
      .within(() => {
        cy.contains("Page 1 of 2").should("be.visible");
      });
  });

  it("allows a visitor to mark a testimonial as helpful", () => {
    cy.get('section[aria-labelledby="testimonials-heading"]')
      .should("be.visible")
      .within(() => {
        cy.contains("button", "Helpful").first().should("contain", "3").click();
      });

    cy.wait("@markHelpful");

    cy.get('section[aria-labelledby="testimonials-heading"]').within(() => {
      cy.contains("button", "Helpful").first().should("contain", "4");
    });
  });
});
