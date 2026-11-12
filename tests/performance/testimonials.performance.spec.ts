import { test, expect } from "@playwright/test";
test.describe("Testimonials Performance", () => {
  test("Testimonials section loads within the performance threshold", async ({
    page,
  }) => {
    const start = Date.now();
    const response = await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });
    const loadTime = Date.now() - start;
    expect(response?.ok()).toBeTruthy();
    await expect(
      page.locator('section[aria-labelledby="testimonials-heading"]'),
    ).toBeVisible();
    expect(loadTime).toBeLessThan(5000);
  });
});
