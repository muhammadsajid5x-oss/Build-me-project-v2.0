import { expect, test } from "@playwright/test";

const WEB_URL = "http://localhost:5173";

test.describe("Share This Page Security", () => {
  test("share controls do not expose unsafe inline navigation targets", async ({
    page,
  }) => {
    await page.goto(WEB_URL);

    await page
      .getByRole("button", {
        name: "Share this page",
      })
      .click();

    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();

    const shareButtons = [
      "Facebook",
      "Instagram",
      "Twitter",
      "LinkedIn",
      "Pinterest",
      "TikTok",
      "Telegram",
      "WhatsApp",
      "YouTube",
      "Snapchat",
      "Email",
    ];

    for (const channel of shareButtons) {
      const button = dialog.getByRole("button", {
        name: channel,
      });

      await expect(button).toBeVisible();
      await expect(button).not.toHaveAttribute("href");
    }
  });

  test("share dialog does not render executable HTML from the page URL", async ({
    page,
  }) => {
    await page.goto(WEB_URL);

    await page
      .getByRole("button", {
        name: "Share this page",
      })
      .click();

    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();

    await expect(dialog.locator("script")).toHaveCount(0);
    await expect(dialog.locator("iframe")).toHaveCount(0);
    await expect(dialog.locator("object")).toHaveCount(0);
    await expect(dialog.locator("embed")).toHaveCount(0);
  });
});
