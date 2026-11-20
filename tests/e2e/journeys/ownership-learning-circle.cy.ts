describe("Ownership Learning Circle", () => {
  it("loads the Ownership Learning Circle page", () => {
    cy.visit("/ownership-learning-circle");

    cy.get("body").should("not.be.empty");
  });
});
