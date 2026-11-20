describe("Coffee With Me", () => {
  it("loads the Coffee With Me page", () => {
    cy.visit("/coffee-with-me");

    cy.get("body").should("not.be.empty");
  });
});
