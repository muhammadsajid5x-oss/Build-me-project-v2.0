import { test, expect } from "@playwright/test";

test.describe("Follow Us Performance", () => {
  test("homepage with Follow Us loads within the performance threshold", async ({
    page,
  }) => {
    const start = Date.now();

    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "Follow Us" }),
    ).toBeVisible();

    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(5000);
  });
});
