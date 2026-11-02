import { expect, test } from "@playwright/test";

test.describe("Ownership Audit Performance", () => {
  test("Ownership Audit journey loads within the performance threshold", async ({
    page,
  }) => {
    const startTime = Date.now();

    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });

    await page.getByRole("button", { name: "Get Quick Wins" }).click();

    await page.getByRole("button", { name: "Ownership Audit" }).click();

    await expect(
      page.getByRole("heading", {
        name: "Technology Ownership Audit",
        exact: true,
      }),
    ).toBeVisible();

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });
});
