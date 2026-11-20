import { test, expect } from "@playwright/test";

const API_URL = "http://localhost:3000";

test.describe("Ownership Learning Circle API Security", () => {
  test("does not expose the Express x-powered-by header", async ({
    request,
  }) => {
    const response = await request.post(
      `${API_URL}/api/v1/ownership-learning-circle-requests`,
      {
        data: {},
      },
    );

    expect(response.status()).toBe(400);
    expect(response.headers()["x-powered-by"]).toBeUndefined();
  });

  test("returns the expected security header", async ({ request }) => {
    const response = await request.post(
      `${API_URL}/api/v1/ownership-learning-circle-requests`,
      {
        data: {},
      },
    );

    expect(response.status()).toBe(400);
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("rejects invalid Learning Circle visitor data", async ({ request }) => {
    const response = await request.post(
      `${API_URL}/api/v1/ownership-learning-circle-requests`,
      {
        data: {
          name: "",
          email: "invalid-email",
        },
      },
    );

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body).toHaveProperty("error");
    expect(body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });

  test("rejects unauthenticated access to Learning Circle records", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_URL}/api/v1/ownership-learning-circle-requests`,
    );

    expect(response.status()).toBe(401);

    const body = await response.json();

    expect(body).toHaveProperty("error");
    expect(body.error).toHaveProperty("code", "UNAUTHORIZED");
  });
});
