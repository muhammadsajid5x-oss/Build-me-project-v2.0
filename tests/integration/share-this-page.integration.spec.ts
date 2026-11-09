import { expect, test } from "@playwright/test";

const webUrl = "http://localhost:5173";

test.describe("Share This Page Integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(webUrl);
  });

  test("renders the Share This Page section", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: "Share This Page",
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Share this page",
      }),
    ).toBeVisible();
  });

  test("opens the share dialog with all supported channels", async ({
    page,
  }) => {
    await page
      .getByRole("button", {
        name: "Share this page",
      })
      .click();

    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();

    await expect(
      dialog.getByText("Share Cup&Cummit with your network"),
    ).toBeVisible();

    const channels = [
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

    for (const channel of channels) {
      await expect(
        dialog.getByRole("button", {
          name: channel,
        }),
      ).toBeVisible();
    }

    await expect(
      dialog.getByRole("button", {
        name: "Copy Link",
      }),
    ).toBeVisible();
  });

  test("closes the share dialog with the close button", async ({ page }) => {
    await page
      .getByRole("button", {
        name: "Share this page",
      })
      .click();

    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();

    await dialog
      .getByRole("button", {
        name: "Close share dialog",
      })
      .click();

    await expect(dialog).not.toBeVisible();
  });

  test("closes the share dialog with Escape", async ({ page }) => {
    await page
      .getByRole("button", {
        name: "Share this page",
      })
      .click();

    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(dialog).not.toBeVisible();
  });
});
