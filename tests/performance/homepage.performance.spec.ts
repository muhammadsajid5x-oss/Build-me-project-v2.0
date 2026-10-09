import { test, expect } from "@playwright/test";

test.describe("Build Me Performance", () => {
  test("homepage loads within the performance threshold", async ({ page }) => {
    const start = Date.now();

    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });

    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(5000);
  });
});
