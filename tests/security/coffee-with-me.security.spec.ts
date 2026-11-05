import { test, expect } from "@playwright/test";
test.describe("Coffee With Me API Security", () => {
  test("does not expose the Express x-powered-by header", async ({
    request,
  }) => {
    const response = await request.post(
      "http://localhost:3000/api/v1/coffee-with-me-requests",
      {
        data: {},
      },
    );
    expect(response.status()).toBe(400);
    expect(response.headers()["x-powered-by"]).toBeUndefined();
  });
  test("returns the expected security header", async ({ request }) => {
    const response = await request.post(
      "http://localhost:3000/api/v1/coffee-with-me-requests",
      {
        data: {},
      },
    );
    expect(response.status()).toBe(400);
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  });
  test("rejects invalid request data", async ({ request }) => {
    const response = await request.post(
      "http://localhost:3000/api/v1/coffee-with-me-requests",
      {
        data: {
          name: "<script>alert('xss')</script>",
          email: "not-an-email",
          topic: "",
        },
      },
    );
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error");
    expect(body.error).toHaveProperty("details");
  });
});
