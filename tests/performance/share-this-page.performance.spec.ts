import { expect, test } from "@playwright/test";

const WEB_URL = "http://localhost:5173/";

test.describe("Share This Page Performance", () => {
  test("homepage reaches the Share This Page experience within the threshold", async ({
    page,
  }) => {
    await page.goto(WEB_URL, {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "Share This Page" }),
    ).toBeVisible();

    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming | undefined;

      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd ?? 0,
        loadEventEnd: navigation?.loadEventEnd ?? 0,
      };
    });

    expect(metrics.domContentLoaded).toBeGreaterThan(0);
    expect(metrics.domContentLoaded).toBeLessThan(5000);

    if (metrics.loadEventEnd > 0) {
      expect(metrics.loadEventEnd).toBeLessThan(5000);
    }
  });

  test("opens the Share This Page dialog without excessive DOM growth", async ({
    page,
  }) => {
    await page.goto(WEB_URL, {
      waitUntil: "domcontentloaded",
    });

    const before = await page.locator("body *").count();

    await page
      .getByRole("button", { name: "Share this page" })
      .click();

    await expect(page.getByRole("dialog")).toBeVisible();

    const after = await page.locator("body *").count();

    expect(after - before).toBeLessThan(100);
  });
});
