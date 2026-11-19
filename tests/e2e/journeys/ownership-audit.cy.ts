describe("Ownership Audit", () => {
  it("loads the Ownership Audit page", () => {
    cy.visit("/ownership-audit");

    cy.get("body").should("not.be.empty");
  });
});
