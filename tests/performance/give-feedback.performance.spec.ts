import { expect, test } from "@playwright/test";

test.describe("Give Feedback performance", () => {
  test("homepage and Give Feedback CTA render within the threshold", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("button", { name: /Give Feedback/i }),
    ).toBeVisible();

    const navigationTiming = await page.evaluate(() => {
      const entry = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;

      return {
        domContentLoaded: entry.domContentLoadedEventEnd,
        load: entry.loadEventEnd,
      };
    });

    expect(navigationTiming.domContentLoaded).toBeGreaterThan(0);
    expect(navigationTiming.domContentLoaded).toBeLessThan(5000);

    if (navigationTiming.load > 0) {
      expect(navigationTiming.load).toBeLessThan(5000);
    }
  });

  test("Give Feedback modal opens without excessive DOM growth", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });

    const button = page.getByRole("button", {
      name: /Give Feedback/i,
    });

    await expect(button).toBeVisible();

    const before = await page.locator("body *").count();

    await button.click();

    await expect(page.getByRole("dialog")).toBeVisible();

    const after = await page.locator("body *").count();

    expect(after - before).toBeLessThan(250);
  });
});
