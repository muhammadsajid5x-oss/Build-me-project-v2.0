import { test, expect } from "@playwright/test";
test.describe("Ownership Audit Performance", () => {
  test("Ownership Audit journey loads within the performance threshold", async ({
    page,
  }) => {
    const start = Date.now();
    const response = await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.ok()).toBeTruthy();
    await page.getByRole("button", { name: "Work With Me" }).click();
    await page
      .getByRole("button", { name: "Ownership Audit" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Ownership Audit" }),
    ).toBeVisible();
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(5000);
  });
});
