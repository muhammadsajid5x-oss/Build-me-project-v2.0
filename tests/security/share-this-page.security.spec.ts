import { expect, test } from "@playwright/test";

const WEB_URL = "http://localhost:5173/";

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

  test("channel sharing uses approved protocols and safe window features", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const calls: Array<[string, string, string]> = [];

      window.open = ((url?: string | URL, target?: string, features?: string) => {
        calls.push([
          String(url ?? ""),
          String(target ?? ""),
          String(features ?? ""),
        ]);
        return null;
      }) as typeof window.open;

      Object.defineProperty(window, "__shareOpenCalls", {
        configurable: true,
        value: calls,
      });
    });

    await page.goto(WEB_URL);

    await page.getByRole("button", { name: "Share this page" }).click();

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
      await page.getByRole("button", { name: channel }).click();
    }

    const calls = await page.evaluate(
      () =>
        (window as Window & {
          __shareOpenCalls: Array<[string, string, string]>;
        }).__shareOpenCalls,
    );

    expect(calls).toHaveLength(channels.length);

    for (const [url, target, features] of calls) {
      expect(url).not.toMatch(/^javascript:/i);
      expect(url).not.toMatch(/^data:/i);
      expect(url).toMatch(/^(https?:|mailto:)/i);
      expect(target).toBe("_blank");
      expect(features).toContain("noopener");
      expect(features).toContain("noreferrer");
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
