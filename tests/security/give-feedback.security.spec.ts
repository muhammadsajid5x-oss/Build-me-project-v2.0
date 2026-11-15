import { expect, test } from "@playwright/test";

test.describe("Give Feedback security", () => {
  test("feedback dialog contains no dangerous URLs", async ({ page }) => {
    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });

    await page
      .getByRole("button", {
        name: /Give Feedback/i,
      })
      .click();

    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();

    const hrefs = await dialog
      .locator("[href]")
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("href")),
      );

    for (const href of hrefs) {
      expect(href ?? "").not.toMatch(/^javascript:/i);
      expect(href ?? "").not.toMatch(/^data:/i);
      expect(href ?? "").not.toMatch(/^vbscript:/i);
    }
  });

  test("feedback dialog contains no executable embedded elements", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });

    await page
      .getByRole("button", {
        name: /Give Feedback/i,
      })
      .click();

    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();

    await expect(dialog.locator("script")).toHaveCount(0);
    await expect(dialog.locator("iframe")).toHaveCount(0);
    await expect(dialog.locator("object")).toHaveCount(0);
    await expect(dialog.locator("embed")).toHaveCount(0);
  });

  test("feedback inputs do not render HTML from user input", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });

    await page
      .getByRole("button", {
        name: /Give Feedback/i,
      })
      .click();

    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();

    await dialog
      .getByRole("button", {
        name: /Score Us/i,
      })
      .click();

    const maliciousValue = "<img src=x onerror=alert(1)>";

    const textInput = dialog.locator('input[type="text"]').first();

    await expect(textInput).toBeVisible();

    await textInput.fill(maliciousValue);

    await expect(textInput).toHaveValue(maliciousValue);

    await expect(page.locator("img[src='x']")).toHaveCount(0);
    await expect(page.locator("[onerror]")).toHaveCount(0);
  });
});
