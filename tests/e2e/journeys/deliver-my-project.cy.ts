describe("Deliver My Project", () => {
  it("loads the Deliver My Project page", () => {
    cy.visit("/deliver-my-project");

    cy.get("body").should("not.be.empty");
  });
});
