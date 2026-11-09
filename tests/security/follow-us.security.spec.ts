import { test, expect } from "@playwright/test";

const WEB_URL = "http://localhost:5173";

test.describe("Follow Us Security", () => {
  test("social links use safe external-link attributes", async ({ page }) => {
    await page.goto(WEB_URL);

    const links = page.locator(
      'a[aria-label="Connect with me on LinkedIn"],' +
        'a[aria-label="Connect with me on Facebook"],' +
        'a[aria-label="Visit my YouTube channel"],' +
        'a[aria-label="Contact me on WhatsApp"],' +
        'a[aria-label="Contact me on Telegram"]',
    );

    await expect(links).toHaveCount(5);

    for (let i = 0; i < 5; i += 1) {
      await expect(links.nth(i)).toHaveAttribute("target", "_blank");
      await expect(links.nth(i)).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
