import { expect, test } from "@playwright/test";

test.describe("About performance", () => {
  test("About page loads within 5 seconds", async ({ page }) => {
    const start = Date.now();

    await page.goto("http://localhost:5173/about", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.locator("body")).toContainText("About Us");

    expect(Date.now() - start).toBeLessThan(5000);
  });
});
