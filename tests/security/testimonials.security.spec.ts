import { test, expect } from "@playwright/test";
const API_URL = "http://localhost:3000";
test.describe("Testimonials API Security", () => {
  test("does not expose the Express x-powered-by header", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_URL}/api/v1/testimonials`,
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["x-powered-by"]).toBeUndefined();
  });
  test("returns the expected security header", async ({ request }) => {
    const response = await request.get(
      `${API_URL}/api/v1/testimonials`,
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  });
  test("handles invalid pagination input without exposing server errors", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_URL}/api/v1/testimonials?page=invalid&limit=invalid`,
    );
    expect(response.status()).not.toBe(500);
    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("pagination");
  });
});
