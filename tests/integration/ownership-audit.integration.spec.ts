import { test, expect } from "@playwright/test";
import { connection } from "../../database/drizzle/client.js";

const apiUrl = "http://localhost:3000";

test.describe("Ownership Audit API Integration", () => {
  test.describe("High Risk (A/A/A)", () => {
    test("creates and persists with High Risk category", async ({ request }) => {
      const uniqueEmail = `ownership-highrisk-${Date.now()}@example.com`;

      const payload = { step1: "A", step2: "A", step3: "A", visitorEmail: uniqueEmail };

      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: payload,
      });

      expect(response.status()).toBe(201);

      const body = await response.json();

      expect(body.data).toMatchObject({
        step1: "A", step2: "A", step3: "A",
        score: 3, category: "High Risk", visitorEmail: uniqueEmail,
      });

      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();

      const [persistedAudit] = await connection`
        SELECT id, step1, step2, step3, score, category, visitor_email
        FROM ownership_audits WHERE id = ${body.data.id} LIMIT 1
      `;

      expect(persistedAudit).toMatchObject({
        id: body.data.id,
        step1: "A", step2: "A", step3: "A",
        score: 3, category: "High Risk", visitor_email: uniqueEmail,
      });
    });
  });

  test.describe("Moderate Control (B/B/B)", () => {
    test("creates and persists with Moderate Control category", async ({ request }) => {
      const uniqueEmail = `ownership-moderate-${Date.now()}@example.com`;

      const payload = { step1: "B", step2: "B", step3: "B", visitorEmail: uniqueEmail };

      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: payload,
      });

      expect(response.status()).toBe(201);

      const body = await response.json();

      expect(body.data).toMatchObject({
        step1: "B", step2: "B", step3: "B",
        score: 9, category: "Moderate Control", visitorEmail: uniqueEmail,
      });

      const [persistedAudit] = await connection`
        SELECT id, step1, step2, step3, score, category, visitor_email
        FROM ownership_audits WHERE id = ${body.data.id} LIMIT 1
      `;

      expect(persistedAudit).toMatchObject({
        id: body.data.id,
        step1: "B", step2: "B", step3: "B",
        score: 9, category: "Moderate Control", visitor_email: uniqueEmail,
      });
    });
  });

  test.describe("Strong Ownership (C/C/C)", () => {
    test("creates and persists with Strong Ownership category", async ({ request }) => {
      const uniqueEmail = `ownership-strong-${Date.now()}@example.com`;

      const payload = { step1: "C", step2: "C", step3: "C", visitorEmail: uniqueEmail };

      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: payload,
      });

      expect(response.status()).toBe(201);

      const body = await response.json();

      expect(body.data).toMatchObject({
        step1: "C", step2: "C", step3: "C",
        score: 15, category: "Strong Ownership", visitorEmail: uniqueEmail,
      });

      const [persistedAudit] = await connection`
        SELECT id, step1, step2, step3, score, category, visitor_email
        FROM ownership_audits WHERE id = ${body.data.id} LIMIT 1
      `;

      expect(persistedAudit).toMatchObject({
        id: body.data.id,
        step1: "C", step2: "C", step3: "C",
        score: 15, category: "Strong Ownership", visitor_email: uniqueEmail,
      });
    });
  });

  test.describe("Invalid payload behavior", () => {
    test("rejects request with missing step1", async ({ request }) => {
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: { step2: "A", step3: "A" },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });

    test("rejects request with missing step2", async ({ request }) => {
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: { step1: "A", step3: "A" },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });

    test("rejects request with missing step3", async ({ request }) => {
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: { step1: "A", step2: "A" },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });

    test("rejects request with invalid step option", async ({ request }) => {
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: { step1: "X", step2: "A", step3: "A" },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });

    test("rejects request with invalid visitor email type", async ({ request }) => {
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: { step1: "A", step2: "A", step3: "A", visitorEmail: 12345 },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.message).toBe("Visitor email must be a string.");
    });
  });
});