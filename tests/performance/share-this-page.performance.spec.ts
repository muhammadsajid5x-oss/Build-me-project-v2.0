import { expect, test } from "@playwright/test";

test.describe("Share This Page Performance", () => {
  test("homepage with Share This Page loads within the performance threshold", async ({
    page,
  }) => {
    const start = Date.now();

    await page.goto("http://localhost:5173/", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "Share This Page" }),
    ).toBeVisible();

    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(5000);
  });
});
