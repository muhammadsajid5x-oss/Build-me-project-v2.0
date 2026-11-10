import { test, expect } from "@playwright/test";

test("share channel buttons do not expose direct hrefs", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  await page.getByRole("button", { name: "Share this page" }).click();

  const channels = page.locator("dialog button").filter({
    hasNotText: /copy link|close/i,
  });

  const count = await channels.count();

  for (let index = 0; index < count; index += 1) {
    await expect(channels.nth(index)).not.toHaveAttribute("href", /.+/);
  }
});

test("share dialog does not render executable embed elements", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  await page.getByRole("button", { name: "Share this page" }).click();

  const dialog = page.locator("dialog");

  await expect(dialog.locator("script, iframe, object, embed")).toHaveCount(0);
});
