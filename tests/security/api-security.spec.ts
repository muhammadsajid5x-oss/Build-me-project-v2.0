import { test, expect } from "@playwright/test";

test.describe("Build Me API Security", () => {
  test("does not expose the Express x-powered-by header", async ({
    request,
  }) => {
    const response = await request.get("http://localhost:3000/health");

    expect(response.ok()).toBeTruthy();
    expect(response.headers()["x-powered-by"]).toBeUndefined();
  });

  test("returns security headers", async ({ request }) => {
    const response = await request.get("http://localhost:3000/health");

    expect(response.ok()).toBeTruthy();

    const headers = response.headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
  });
});
