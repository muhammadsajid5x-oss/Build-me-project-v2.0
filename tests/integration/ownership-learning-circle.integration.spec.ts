import { test, expect } from "@playwright/test";
import { connection } from "../../database/drizzle/client.js";

const apiUrl = "http://localhost:3000";
const endpoint = `${apiUrl}/api/v1/ownership-learning-circle-requests`;
const source = "ownership-learning-circle";

test.describe("Ownership Learning Circle API Integration", () => {
  test.describe("Valid Learning Circle request", () => {
    test("creates and persists a visitor request in the leads table", async ({
      request,
    }) => {
      const uniqueEmail = `learning-circle-${Date.now()}@example.com`;

      const response = await request.post(endpoint, {
        data: {
          name: "Learning Circle Test Visitor",
          email: uniqueEmail,
        },
      });

      expect(response.status()).toBe(201);

      const body = await response.json();

      expect(body.data).toMatchObject({
        name: "Learning Circle Test Visitor",
        email: uniqueEmail,
        status: "new",
      });

      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();

      const [persistedLead] = await connection`
        SELECT
          id,
          name,
          email,
          source,
          status,
          created_at
        FROM leads
        WHERE id = ${body.data.id}
        LIMIT 1
      `;

      expect(persistedLead).toMatchObject({
        id: body.data.id,
        name: "Learning Circle Test Visitor",
        email: uniqueEmail,
        source,
        status: "new",
      });

      expect(persistedLead.created_at).toBeDefined();
    });
  });

  test.describe("Email normalization", () => {
    test("persists visitor email in lowercase form", async ({ request }) => {
      const uniqueEmail = `LEARNING-CIRCLE-${Date.now()}@EXAMPLE.COM`;

      const response = await request.post(endpoint, {
        data: {
          name: "Email Normalization Visitor",
          email: uniqueEmail,
        },
      });

      expect(response.status()).toBe(201);

      const body = await response.json();

      expect(body.data.email).toBe(uniqueEmail.toLowerCase());

      const [persistedLead] = await connection`
        SELECT id, name, email, source
        FROM leads
        WHERE id = ${body.data.id}
        LIMIT 1
      `;

      expect(persistedLead).toMatchObject({
        id: body.data.id,
        name: "Email Normalization Visitor",
        email: uniqueEmail.toLowerCase(),
        source,
      });
    });
  });

  test.describe("Invalid payload behavior", () => {
    test("rejects a request with missing visitor name", async ({ request }) => {
      const response = await request.post(endpoint, {
        data: {
          email: "learning-circle-validation@example.com",
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "name",
            message: "Name is required.",
          }),
        ]),
      );
    });

    test("rejects a request with an invalid email address", async ({
      request,
    }) => {
      const response = await request.post(endpoint, {
        data: {
          name: "Learning Circle Validation Visitor",
          email: "invalid-email",
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            message: "Please enter a valid email address.",
          }),
        ]),
      );
    });
  });

  test.describe("Access control", () => {
    test("rejects unauthenticated access to Learning Circle requests", async ({
      request,
    }) => {
      const response = await request.get(endpoint);

      expect(response.status()).toBe(401);
    });
  });
});
