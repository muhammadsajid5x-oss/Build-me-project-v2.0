import { test, expect } from "@playwright/test";

test.describe("Give Referrals performance", () => {
  test("Give Referrals CTA renders within an acceptable time", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("button", { name: "Give Referrals" }),
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

  test("Give Referrals modal opens without excessive DOM growth", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("button", { name: "Give Referrals" }),
    ).toBeVisible();

    const before = await page.locator("body *").count();

    await page.getByRole("button", { name: "Give Referrals" }).click();

    await expect(
      page.getByRole("dialog", { name: "Give Referrals" }),
    ).toBeVisible();

    const after = await page.locator("body *").count();

    expect(after - before).toBeLessThan(200);
  });
});
