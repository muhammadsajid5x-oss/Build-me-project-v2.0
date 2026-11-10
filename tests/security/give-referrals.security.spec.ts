import { test, expect } from "@playwright/test";

test.describe("Give Referrals security", () => {
  test("referral form uses form controls without executable URLs", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173/");

    await page.getByRole("button", { name: "Give Referrals" }).click();

    const dialog = page.getByRole("dialog", { name: "Give Referrals" });

    await expect(dialog).toBeVisible();

    const links = dialog.locator("a");

    await expect(links).toHaveCount(0);

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

  test("referral dialog does not contain executable embed elements", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173/");

    await page.getByRole("button", { name: "Give Referrals" }).click();

    const dialog = page.getByRole("dialog", { name: "Give Referrals" });

    await expect(dialog.locator("script")).toHaveCount(0);
    await expect(dialog.locator("iframe")).toHaveCount(0);
    await expect(dialog.locator("object")).toHaveCount(0);
    await expect(dialog.locator("embed")).toHaveCount(0);
  });

  test("referral inputs do not render submitted values as HTML", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173/");

    await page.getByRole("button", { name: "Give Referrals" }).click();

    const maliciousName = "<img src=x onerror=alert(1)>";

    await page.locator('input[type="text"]').first().fill(maliciousName);

    await expect(page.locator('input[type="text"]').first()).toHaveValue(
      maliciousName,
    );

    await expect(page.locator("img[src='x']")).toHaveCount(0);
    await expect(page.locator("[onerror]")).toHaveCount(0);
  });

  test("referral dialog does not contain dangerous inline event attributes", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173/");

    await page.getByRole("button", { name: "Give Referrals" }).click();

    const dangerousAttributes = await page
      .getByRole("dialog", { name: "Give Referrals" })
      .locator("*")
      .evaluateAll((elements) =>
        elements.flatMap((element) =>
          Array.from(element.attributes)
            .filter((attribute) => /^on/i.test(attribute.name))
            .map((attribute) => attribute.name),
        ),
      );

    expect(dangerousAttributes).toEqual([]);
  });
});
