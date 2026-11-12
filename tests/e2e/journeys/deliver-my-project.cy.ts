describe("Deliver My Project pricing", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/v1/service-plans", {
      statusCode: 200,
      body: {
        data: [
          {
            id: "deliver-starter",
            service: "deliver-my-project",
            planName: "Starter",
            slug: "deliver-my-project-starter",
            description: "Starter delivery project",
            price: 499,
            currency: "USD",
            billingPeriod: "one_time",
            active: true,
          },
          {
            id: "deliver-growth",
            service: "deliver-my-project",
            planName: "Growth",
            slug: "deliver-my-project-growth",
            description: "Growth delivery project",
            price: 1799,
            currency: "USD",
            billingPeriod: "one_time",
            active: true,
          },
          {
            id: "deliver-complete",
            service: "deliver-my-project",
            planName: "Complete",
            slug: "deliver-my-project-complete",
            description: "Complete delivery project",
            price: 4499,
            currency: "USD",
            billingPeriod: "one_time",
            active: true,
          },
        ],
      },
    }).as("servicePlans");
  });

  it("shows the three Deliver My Project price plans", () => {
    cy.visit("/deliver-my-project");

    cy.wait("@servicePlans");

    cy.contains("Price Plans").should("be.visible");

    cy.contains("Starter").should("be.visible");
    cy.contains("$499").should("be.visible");

    cy.contains("Growth").should("be.visible");
    cy.contains("$1,799").should("be.visible");

    cy.contains("Complete").should("be.visible");
    cy.contains("$4,499").should("be.visible");
  });
});
