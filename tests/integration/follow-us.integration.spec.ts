import { test, expect } from "@playwright/test";

const webUrl = "http://localhost:5173";

test.describe("Follow Us Integration", () => {
  test("renders the Follow Us social connections", async ({ page }) => {
    await page.goto(webUrl);

    const followUs = page.getByRole("heading", {
      name: "Follow Us",
    });

    await expect(followUs).toBeVisible();

    await expect(
      page.getByRole("link", {
        name: "Connect with me on LinkedIn",
      }),
    ).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/muhammad-sajid-softwaredeveloper/",
    );

    await expect(
      page.getByRole("link", {
        name: "Connect with me on Facebook",
      }),
    ).toHaveAttribute("href", "https://web.facebook.com/rao.sajid.1232");

    await expect(
      page.getByRole("link", {
        name: "Visit my YouTube channel",
      }),
    ).toHaveAttribute(
      "href",
      "https://www.youtube.com/channel/UCX80pgVBcXTgawdM3hAQzBg",
    );

    await expect(
      page.getByRole("link", {
        name: "Contact me on WhatsApp",
      }),
    ).toHaveAttribute("href", "https://wa.me/923009164602");

    await expect(
      page.getByRole("link", {
        name: "Contact me on Telegram",
      }),
    ).toHaveAttribute("href", "https://t.me/+923009164602");
  });
});
