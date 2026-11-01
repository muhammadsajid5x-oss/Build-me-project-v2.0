import { test, expect } from "@playwright/test";
import { connection } from "../../database/drizzle/client.js";
const apiUrl = "http://localhost:3000";
const answersFor = (option: "A" | "B" | "C") => ({
  q1: option,
  q2: option,
  q3: option,
  q4: option,
  q5: option,
  q6: option,
  q7: option,
  q8: option,
  q9: option,
  q10: option,
});
test.describe("Ownership Audit API Integration", () => {
  test.describe("High Risk (A/A/A)", () => {
    test("creates and persists with High Risk category", async ({ request }) => {
      const uniqueEmail = `ownership-highrisk-${Date.now()}@example.com`;
      const answers = answersFor("A");
      const payload = {
        fullName: "High Risk Test Visitor",
        visitorEmail: uniqueEmail,
        answers,
      };
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: payload,
      });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.data).toMatchObject({
        fullName: "High Risk Test Visitor",
        visitorEmail: uniqueEmail,
        answers,
        score: 20,
        category: "High Risk",
      });
      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
      const [persistedAudit] = await connection`
        SELECT id, step1, step2, step3, score, category, visitor_email, answers
        FROM ownership_audits
        WHERE id = ${body.data.id}
        LIMIT 1
      `;
      expect(persistedAudit).toMatchObject({
        id: body.data.id,
        step1: "A,A",
        step2: "A,A,A,A",
        step3: "A,A,A,A",
        score: 20,
        category: "High Risk",
        visitor_email: uniqueEmail,
      });
      expect(persistedAudit.answers).toMatchObject({
        fullName: "High Risk Test Visitor",
        ...answers,
      });
    });
  });
  test.describe("Moderate Control (B/B/B)", () => {
    test("creates and persists with Moderate Control category", async ({ request }) => {
      const uniqueEmail = `ownership-moderate-${Date.now()}@example.com`;
      const answers = answersFor("B");
      const payload = {
        fullName: "Moderate Control Test Visitor",
        visitorEmail: uniqueEmail,
        answers,
      };
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: payload,
      });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.data).toMatchObject({
        fullName: "Moderate Control Test Visitor",
        visitorEmail: uniqueEmail,
        answers,
        score: 50,
        category: "Moderate Control",
      });
      const [persistedAudit] = await connection`
        SELECT id, step1, step2, step3, score, category, visitor_email, answers
        FROM ownership_audits
        WHERE id = ${body.data.id}
        LIMIT 1
      `;
      expect(persistedAudit).toMatchObject({
        id: body.data.id,
        step1: "B,B",
        step2: "B,B,B,B",
        step3: "B,B,B,B",
        score: 50,
        category: "Moderate Control",
        visitor_email: uniqueEmail,
      });
      expect(persistedAudit.answers).toMatchObject({
        fullName: "Moderate Control Test Visitor",
        ...answers,
      });
    });
  });
  test.describe("Strong Ownership (C/C/C)", () => {
    test("creates and persists with Strong Ownership category", async ({ request }) => {
      const uniqueEmail = `ownership-strong-${Date.now()}@example.com`;
      const answers = answersFor("C");
      const payload = {
        fullName: "Strong Ownership Test Visitor",
        visitorEmail: uniqueEmail,
        answers,
      };
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: payload,
      });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.data).toMatchObject({
        fullName: "Strong Ownership Test Visitor",
        visitorEmail: uniqueEmail,
        answers,
        score: 100,
        category: "Strong Ownership",
      });
      const [persistedAudit] = await connection`
        SELECT id, step1, step2, step3, score, category, visitor_email, answers
        FROM ownership_audits
        WHERE id = ${body.data.id}
        LIMIT 1
      `;
      expect(persistedAudit).toMatchObject({
        id: body.data.id,
        step1: "C,C",
        step2: "C,C,C,C",
        step3: "C,C,C,C",
        score: 100,
        category: "Strong Ownership",
        visitor_email: uniqueEmail,
      });
      expect(persistedAudit.answers).toMatchObject({
        fullName: "Strong Ownership Test Visitor",
        ...answers,
      });
    });
  });
  test.describe("Invalid payload behavior", () => {
    test("rejects request with missing full name", async ({ request }) => {
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: {
          visitorEmail: "invalid-test@example.com",
          answers: answersFor("A"),
        },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.message).toBe("Full name is required.");
    });
    test("rejects request with missing answer", async ({ request }) => {
      const answers = answersFor("A");
      delete answers.q10;
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: {
          fullName: "Validation Test Visitor",
          visitorEmail: "invalid-test@example.com",
          answers,
        },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.message).toBe("All ten audit answers are required.");
    });
    test("rejects request with invalid answer option", async ({ request }) => {
      const answers = answersFor("A");
      answers.q10 = "X" as "A" | "B" | "C";
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: {
          fullName: "Validation Test Visitor",
          visitorEmail: "invalid-test@example.com",
          answers,
        },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.message).toBe("All ten audit answers are required.");
    });
    test("rejects request with invalid visitor email type", async ({ request }) => {
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: {
          fullName: "Validation Test Visitor",
          visitorEmail: 12345,
          answers: answersFor("A"),
        },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.message).toBe(
        "A valid visitor email is required.",
      );
    });
  });
});
