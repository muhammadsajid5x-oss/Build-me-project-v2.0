describe("Mentor Me", () => {
  it("loads the Mentor Me page", () => {
    cy.visit("/mentor-me");

    cy.get("body").should("not.be.empty");
  });
});
