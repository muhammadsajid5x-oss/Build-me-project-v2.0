import { test, expect } from "@playwright/test";

test.describe("Build Me API Integration", () => {
  test("health endpoint returns a healthy API status", async ({ request }) => {
    const response = await request.get("http://localhost:3000/health");

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    expect(body).toEqual({
      status: "ok",
      service: "build-me-api",
    });
  });
});
