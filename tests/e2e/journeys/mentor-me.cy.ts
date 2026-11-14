describe("Mentor Me pricing", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/v1/service-plans", {
      statusCode: 200,
      body: {
        data: [
          {
            id: "mentor-starter",
            service: "mentor-me",
            planName: "Starter",
            slug: "mentor-me-starter",
            description: "Starter mentoring plan",
            price: 199,
            currency: "USD",
            billingPeriod: "monthly",
            active: true,
          },
          {
            id: "mentor-growth",
            service: "mentor-me",
            planName: "Growth",
            slug: "mentor-me-growth",
            description: "Growth mentoring plan",
            price: 399,
            currency: "USD",
            billingPeriod: "monthly",
            active: true,
          },
          {
            id: "mentor-complete",
            service: "mentor-me",
            planName: "Complete",
            slug: "mentor-me-complete",
            description: "Complete mentoring plan",
            price: 799,
            currency: "USD",
            billingPeriod: "monthly",
            active: true,
          },
        ],
      },
    }).as("servicePlans");
  });

  it("shows the three Mentor Me price plans", () => {
    cy.visit("/mentor-me");

    cy.wait("@servicePlans");

    cy.contains("Price Plans").should("be.visible");

    cy.contains("Starter").should("be.visible");
    cy.contains("$199").should("be.visible");

    cy.contains("Growth").should("be.visible");
    cy.contains("$399").should("be.visible");

    cy.contains("Complete").should("be.visible");
    cy.contains("$799").should("be.visible");
  });
});
