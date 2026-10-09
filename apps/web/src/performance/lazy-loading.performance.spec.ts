import { test, expect } from "@playwright/test";

test.describe("Lazy Loading Performance", () => {
  test("lazy-loaded homepage loads successfully", async ({ page }) => {
    const start = Date.now();

    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.locator("body")).toBeVisible();

    const loadTime = Date.now() - start;

    console.log(`Lazy-loaded homepage time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(5000);
  });
});
