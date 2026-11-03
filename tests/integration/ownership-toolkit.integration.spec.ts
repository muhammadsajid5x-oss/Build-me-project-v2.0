import { test, expect } from "@playwright/test";
import { connection } from "../../database/drizzle/client.js";

const apiUrl = "http://localhost:3000";

test.describe("Ownership Toolkit API Integration", () => {
  test.describe("Valid Ownership Toolkit access", () => {
    test("creates and persists an Ownership Toolkit access request", async ({
      request,
    }) => {
      const uniqueEmail = `ownership-toolkit-${Date.now()}@example.com`;

      const response = await request.post(
        `${apiUrl}/api/v1/ownership-toolkit-accesses`,
        {
          data: {
            fullName: "Ownership Toolkit Test Visitor",
            visitorEmail: uniqueEmail,
          },
        },
      );

      expect(response.status()).toBe(201);

      const body = await response.json();

      expect(body.data).toMatchObject({
        fullName: "Ownership Toolkit Test Visitor",
        visitorEmail: uniqueEmail,
      });

      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();

      const [persistedAccess] = await connection`
        SELECT
          id,
          user_id,
          full_name,
          visitor_email,
          created_at
        FROM ownership_toolkit_accesses
        WHERE id = ${body.data.id}
        LIMIT 1
      `;

      expect(persistedAccess).toMatchObject({
        id: body.data.id,
        user_id: null,
        full_name: "Ownership Toolkit Test Visitor",
        visitor_email: uniqueEmail,
      });

      expect(persistedAccess.created_at).toBeDefined();
    });
  });

  test.describe("Email normalization", () => {
    test("persists the visitor email in normalized lowercase form", async ({
      request,
    }) => {
      const uniqueEmail = `OWNERSHIP-TOOLKIT-${Date.now()}@EXAMPLE.COM`;

      const response = await request.post(
        `${apiUrl}/api/v1/ownership-toolkit-accesses`,
        {
          data: {
            fullName: "Email Normalization Test Visitor",
            visitorEmail: uniqueEmail,
          },
        },
      );

      expect(response.status()).toBe(201);

      const body = await response.json();

      expect(body.data.visitorEmail).toBe(uniqueEmail.toLowerCase());

      const [persistedAccess] = await connection`
        SELECT
          id,
          full_name,
          visitor_email
        FROM ownership_toolkit_accesses
        WHERE id = ${body.data.id}
        LIMIT 1
      `;

      expect(persistedAccess).toMatchObject({
        id: body.data.id,
        full_name: "Email Normalization Test Visitor",
        visitor_email: uniqueEmail.toLowerCase(),
      });
    });
  });

  test.describe("Invalid payload behavior", () => {
    test("rejects request with missing full name", async ({ request }) => {
      const response = await request.post(
        `${apiUrl}/api/v1/ownership-toolkit-accesses`,
        {
          data: {
            visitorEmail: "ownership-toolkit-validation@example.com",
          },
        },
      );

      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body.error).toBe("Please provide a valid full name.");
    });

    test("rejects request with a full name shorter than two characters", async ({
      request,
    }) => {
      const response = await request.post(
        `${apiUrl}/api/v1/ownership-toolkit-accesses`,
        {
          data: {
            fullName: "A",
            visitorEmail: "ownership-toolkit-validation@example.com",
          },
        },
      );

      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body.error).toBe("Please provide a valid full name.");
    });

    test("rejects request with an invalid visitor email", async ({
      request,
    }) => {
      const response = await request.post(
        `${apiUrl}/api/v1/ownership-toolkit-accesses`,
        {
          data: {
            fullName: "Ownership Toolkit Validation Visitor",
            visitorEmail: "invalid-email",
          },
        },
      );

      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body.error).toBe("Please provide a valid email address.");
    });
  });
});
