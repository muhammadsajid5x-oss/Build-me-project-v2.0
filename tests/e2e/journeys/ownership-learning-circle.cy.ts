describe("Ownership Learning Circle visitor journey", () => {
  const telegramUrl = "https://t.me/+Q9KY1dL4c-BkMjg8";

  function openLearningCircle(): void {
    cy.visit("/");

    cy.contains("button", "Get Quick Wins").should("be.visible").click();

    cy.contains("button", "Ownership Learning Circle")
      .should("be.visible")
      .click();

    cy.contains("Join the Ownership Learning Circle").should("be.visible");
    cy.contains("Step 1 of 3").should("be.visible");
  }

  function goToVisitorDetails(): void {
    cy.contains("button", "Continue").should("be.visible").click();

    cy.contains("Join the Learning Circle").should("be.visible");
    cy.contains("Step 2 of 3").should("be.visible");
  }

  function enterVisitorDetails(): void {
    cy.get("#learning-circle-name")
      .should("be.visible")
      .clear()
      .type("Test Learning Circle Visitor");

    cy.get("#learning-circle-email")
      .should("be.visible")
      .clear()
      .type("learning-circle-test@example.com");
  }

  function mockSuccessfulRegistration(): void {
    cy.intercept(
      "POST",
      "**/api/v1/ownership-learning-circle-requests",
      (request) => {
        expect(request.body).to.deep.equal({
          name: "Test Learning Circle Visitor",
          email: "learning-circle-test@example.com",
        });

        request.reply({
          statusCode: 201,
          body: {
            data: {
              id: "learning-circle-test-id",
              name: "Test Learning Circle Visitor",
              email: "learning-circle-test@example.com",
              status: "new",
              createdAt: "2026-11-01T00:00:00.000Z",
            },
          },
        });
      },
    ).as("createLearningCircleRequest");
  }

  function submitRegistration(): void {
    mockSuccessfulRegistration();

    enterVisitorDetails();

    cy.contains("button", "Join the Learning Circle")
      .should("be.visible")
      .click();

    cy.wait("@createLearningCircleRequest");

    cy.contains("You're ready to join").should("be.visible");
    cy.contains("Step 3 of 3").should("be.visible");
  }

  it("opens the Learning Circle introduction", () => {
    openLearningCircle();

    cy.contains("What is the Learning Circle?").should("be.visible");
    cy.contains("Who is it for?").should("be.visible");
    cy.contains("What do members get?").should("be.visible");

    cy.contains("button", "Continue").should("be.visible");
  });

  it("validates visitor details before submission", () => {
    openLearningCircle();

    goToVisitorDetails();

    cy.contains("button", "Join the Learning Circle")
      .should("be.visible")
      .click();

    cy.contains("Please enter your name.").should("be.visible");

    cy.get("#learning-circle-name")
      .should("be.visible")
      .type("Test Learning Circle Visitor");

    cy.contains("button", "Join the Learning Circle")
      .should("be.visible")
      .click();

    cy.contains("Please enter a valid email address.").should("be.visible");

    cy.get("#learning-circle-email")
      .should("be.visible")
      .type("learning-circle-test@example.com");
  });

  it("submits visitor details and displays the Telegram invitation", () => {
    openLearningCircle();

    goToVisitorDetails();

    submitRegistration();

    cy.contains("The Telegram group will open in a new tab.").should(
      "be.visible",
    );

    cy.contains("button", "Join on Telegram").should("be.visible");
    cy.contains("button", "Copy Telegram Link").should("be.visible");
  });

  it("opens the Telegram invitation in a new tab", () => {
    openLearningCircle();

    goToVisitorDetails();

    submitRegistration();

    cy.window().then((window) => {
      cy.stub(window, "open").as("openTelegram");
    });

    cy.contains("button", "Join on Telegram").should("be.visible").click();

    cy.get("@openTelegram").should(
      "have.been.calledWith",
      telegramUrl,
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("copies the Telegram invitation link", () => {
    openLearningCircle();

    goToVisitorDetails();

    submitRegistration();

    cy.window().then((window) => {
      const writeText = cy.stub().resolves();

      Object.defineProperty(window.navigator, "clipboard", {
        configurable: true,
        value: { writeText },
      });

      cy.wrap(writeText).as("writeTelegramLink");
    });

    cy.contains("button", "Copy Telegram Link").should("be.visible").click();

    cy.get("@writeTelegramLink").should(
      "have.been.calledOnceWith",
      telegramUrl,
    );

    cy.contains("button", "Telegram Link Copied").should("be.visible");
  });
});
