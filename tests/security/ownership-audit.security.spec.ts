import { test, expect } from "@playwright/test";
const API_URL = "http://localhost:3000";
test.describe("Ownership Audit API Security", () => {
  test("does not expose the Express x-powered-by header", async ({
    request,
  }) => {
    const response = await request.post(
      `${API_URL}/api/v1/ownership-audits`,
      {
        data: {},
      },
    );
    expect(response.status()).toBe(400);
    expect(response.headers()["x-powered-by"]).toBeUndefined();
  });
  test("returns the expected security header", async ({ request }) => {
    const response = await request.post(
      `${API_URL}/api/v1/ownership-audits`,
      {
        data: {},
      },
    );
    expect(response.status()).toBe(400);
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  });
  test("rejects invalid audit data", async ({ request }) => {
    const response = await request.post(
      `${API_URL}/api/v1/ownership-audits`,
      {
        data: {
          step1: "X",
          step2: "A",
          step3: "A",
        },
      },
    );
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error");
    expect(body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });
  test("rejects unauthenticated access to audit records", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_URL}/api/v1/ownership-audits`,
    );
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty("error");
    expect(body.error).toHaveProperty("code", "UNAUTHORIZED");
  });
});
