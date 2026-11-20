describe("Ownership Toolkit", () => {
  it("loads the Ownership Toolkit page", () => {
    cy.visit("/ownership-toolkit");

    cy.get("body").should("not.be.empty");
  });
});
