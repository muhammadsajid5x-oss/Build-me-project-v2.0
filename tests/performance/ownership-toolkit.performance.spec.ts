import { expect, test } from "@playwright/test";

test.describe("Ownership Toolkit Performance", () => {
  test("Ownership Toolkit journey loads within the performance threshold", async ({
    page,
  }) => {
    const startTime = Date.now();

    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });

    await page.getByRole("button", { name: "Get Quick Wins" }).click();

    await page.getByRole("button", { name: "Ownership Toolkit" }).click();

    await expect(
      page
        .getByRole("heading", {
          name: "Technology Ownership Toolkit",
          exact: true,
        })
        .first(),
    ).toBeVisible();

    await expect(
      page.getByText("Step 1 of 3", {
        exact: true,
      }),
    ).toBeVisible();

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });
});
