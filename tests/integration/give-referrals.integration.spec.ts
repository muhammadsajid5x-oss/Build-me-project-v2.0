import { test, expect } from "@playwright/test";

const webUrl = "http://localhost:5173";

test.describe("Give Referrals integration", () => {
  test("renders Give Referrals CTA", async ({ page }) => {
    await page.goto(webUrl);

    await expect(
      page.getByRole("heading", { name: "Give Referrals" }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Give Referrals" }),
    ).toBeVisible();

    await expect(page.getByText("Help others grow with us.")).toBeVisible();
  });

  test("opens referral dialog and shows step one", async ({ page }) => {
    await page.goto(webUrl);

    await page.getByRole("button", { name: "Give Referrals" }).click();

    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();

    await expect(
      dialog.getByRole("heading", { name: "Give Referrals" }),
    ).toBeVisible();

    await expect(dialog.getByText("Your Information")).toBeVisible();

    await expect(dialog.getByText("Your Name")).toBeVisible();
    await expect(dialog.getByText("Your Email")).toBeVisible();

    await expect(
      dialog.getByRole("button", { name: "Continue" }),
    ).toBeVisible();
  });

  test("validates step one and moves to step two", async ({ page }) => {
    await page.goto(webUrl);

    await page.getByRole("button", { name: "Give Referrals" }).click();

    const dialog = page.getByRole("dialog");

    await dialog.getByRole("button", { name: "Continue" }).click();

    await expect(dialog.getByText("Please enter your name.")).toBeVisible();

    await dialog.getByPlaceholder("Your name").fill("Muhammad Sajid");
    await dialog.getByPlaceholder("you@example.com").fill("sajid@example.com");

    await dialog.getByRole("button", { name: "Continue" }).click();

    await expect(
      dialog.getByText("Friend, Family, or Colleague"),
    ).toBeVisible();

    await expect(dialog.getByPlaceholder("Their name")).toBeVisible();

    await expect(dialog.getByPlaceholder("their@example.com")).toBeVisible();

    await expect(
      dialog.getByRole("button", { name: "Continue" }),
    ).toBeVisible();
  });

  test("validates step two and moves to confirmation", async ({ page }) => {
    await page.goto(webUrl);

    await page.getByRole("button", { name: "Give Referrals" }).click();

    const dialog = page.getByRole("dialog");

    await dialog.getByPlaceholder("Your name").fill("Muhammad Sajid");
    await dialog.getByPlaceholder("you@example.com").fill("sajid@example.com");

    await dialog.getByRole("button", { name: "Continue" }).click();

    await dialog.getByRole("button", { name: "Continue" }).click();

    await expect(
      dialog.getByText(
        "Please enter your friend's, family member's, or colleague's name.",
      ),
    ).toBeVisible();

    await dialog.getByPlaceholder("Their name").fill("Ali");
    await dialog.getByPlaceholder("their@example.com").fill("ali@example.com");

    await dialog.locator("select").selectOption("friend");

    await dialog.getByRole("button", { name: "Continue" }).click();

    await expect(dialog.getByText("Confirmation")).toBeVisible();

    await expect(
      dialog.getByPlaceholder("Tell us how we can help..."),
    ).toBeVisible();
  });

  test("submits referral and shows confirmation", async ({ page }) => {
    await page.goto(webUrl);

    await page.getByRole("button", { name: "Give Referrals" }).click();

    const dialog = page.getByRole("dialog");

    await dialog.getByPlaceholder("Your name").fill("Muhammad Sajid");
    await dialog.getByPlaceholder("you@example.com").fill("sajid@example.com");

    await dialog.getByRole("button", { name: "Continue" }).click();

    await dialog.getByPlaceholder("Their name").fill("Ali");
    await dialog.getByPlaceholder("their@example.com").fill("ali@example.com");

    await dialog.locator("select").selectOption("friend");

    await dialog.getByRole("button", { name: "Continue" }).click();

    await dialog
      .getByPlaceholder("Tell us how we can help...")
      .fill("I believe this person could benefit from your services.");

    await dialog.getByRole("button", { name: "Submit Referral" }).click();

    await expect(dialog.getByText("Referral Submitted")).toBeVisible();

    await expect(
      dialog.getByText(
        "Thank you for the referral. Your referral details have been submitted successfully.",
      ),
    ).toBeVisible();

    await expect(dialog.getByRole("button", { name: "Done" })).toBeVisible();
  });

  test("closes referral dialog", async ({ page }) => {
    await page.goto(webUrl);

    await page.getByRole("button", { name: "Give Referrals" }).click();

    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Close referral dialog" }).click();

    await expect(dialog).not.toBeVisible();
  });

  test("closes referral dialog with Escape", async ({ page }) => {
    await page.goto(webUrl);

    await page.getByRole("button", { name: "Give Referrals" }).click();

    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(dialog).not.toBeVisible();
  });
});
