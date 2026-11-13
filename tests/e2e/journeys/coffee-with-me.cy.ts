describe("Coffee With Me pricing", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/v1/service-plans", {
      statusCode: 200,
      body: {
        data: [
          {
            id: "coffee-quick-chat",
            service: "coffee-with-me",
            planName: "Quick Chat",
            slug: "coffee-quick-chat",
            description: "Quick conversation",
            price: 39,
            currency: "USD",
            billingPeriod: "one_time",
            active: true,
          },
          {
            id: "coffee-deep-dive",
            service: "coffee-with-me",
            planName: "Deep Dive",
            slug: "coffee-deep-dive",
            description: "Deep conversation",
            price: 99,
            currency: "USD",
            billingPeriod: "one_time",
            active: true,
          },
          {
            id: "coffee-strategy",
            service: "coffee-with-me",
            planName: "Strategy",
            slug: "coffee-strategy",
            description: "Strategy session",
            price: 199,
            currency: "USD",
            billingPeriod: "one_time",
            active: true,
          },
        ],
      },
    }).as("servicePlans");
  });

  it("shows the three Coffee With Me price plans", () => {
    cy.visit("/coffee-with-me");

    cy.wait("@servicePlans");

    cy.contains("Price Plans").should("be.visible");

    cy.contains("Quick Chat").should("be.visible");
    cy.contains("$39").should("be.visible");

    cy.contains("Deep Dive").should("be.visible");
    cy.contains("$99").should("be.visible");

    cy.contains("Strategy").should("be.visible");
    cy.contains("$199").should("be.visible");
  });
});
