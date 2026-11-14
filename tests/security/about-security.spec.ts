import { expect, test } from "@playwright/test";

test.describe("About security", () => {
  test("API keeps security headers enabled", async ({ request }) => {
    const response = await request.get("http://localhost:3000/health");

    expect(response.ok()).toBeTruthy();

    const headers = response.headers();

    expect(headers["x-powered-by"]).toBeUndefined();
    expect(headers["x-content-type-options"]).toBe("nosniff");
  });
});
