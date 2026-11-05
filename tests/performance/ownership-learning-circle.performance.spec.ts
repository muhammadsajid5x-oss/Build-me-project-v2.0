import { expect, test } from "@playwright/test";

test.describe("Ownership Learning Circle Performance", () => {
  test("Ownership Learning Circle journey loads within the performance threshold", async ({
    page,
  }) => {
    const startTime = Date.now();

    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });

    await page.getByRole("button", { name: "Get Quick Wins" }).click();

    await page
      .getByRole("button", { name: "Ownership Learning Circle" })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "Join the Ownership Learning Circle",
        exact: true,
      }),
    ).toBeVisible();

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });
});
