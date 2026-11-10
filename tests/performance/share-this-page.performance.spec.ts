import { test, expect } from "@playwright/test";

test("Share This Page renders within an acceptable time", async ({ page }) => {
  const start = Date.now();

  await page.goto("http://localhost:5173/", {
    waitUntil: "domcontentloaded",
  });

  await expect(page.getByRole("heading", { name: "Share This Page" })).toBeVisible();

  const duration = Date.now() - start;

  expect(duration).toBeLessThan(5000);
});
