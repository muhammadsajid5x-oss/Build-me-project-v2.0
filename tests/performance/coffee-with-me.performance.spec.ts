import { test, expect } from "@playwright/test";
test.describe("Coffee With Me Performance", () => {
  test("Coffee With Me page loads within the performance threshold", async ({
    page,
  }) => {
    const start = Date.now();
    const response = await page.goto("http://localhost:5173/coffee-with-me", {
      waitUntil: "domcontentloaded",
    });
    const loadTime = Date.now() - start;
    expect(response?.ok()).toBeTruthy();
    expect(loadTime).toBeLessThan(5000);
  });
});
