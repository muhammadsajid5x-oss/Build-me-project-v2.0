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
    test("creates and persists with High Risk category", async ({
      request,
    }) => {
      const uniqueEmail = `ownership-highrisk-${Date.now()}@example.com`;
      const answers = answersFor("A");
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: {
          fullName: "High Risk Test Visitor",
          visitorEmail: uniqueEmail,
          answers,
        },
      });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.data).toMatchObject({
        fullName: "High Risk Test Visitor",
        visitorEmail: uniqueEmail,
        answers,
        score: 20,
        category: "High Risk",
        diagnosticResult:
          "High technical debt, unmanaged assets, critical execution gaps.",
        redirectTarget: "Deliver My Project",
      });
      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
      const [persistedAudit] = await connection`
        SELECT
          id,
          full_name,
          visitor_email,
          q1,
          q2,
          q3,
          q4,
          q5,
          q6,
          q7,
          q8,
          q9,
          q10,
          score,
          category,
          diagnostic_result,
          redirect_target,
          answers
        FROM ownership_audits
        WHERE id = ${body.data.id}
        LIMIT 1
      `;
      expect(persistedAudit).toMatchObject({
        id: body.data.id,
        full_name: "High Risk Test Visitor",
        visitor_email: uniqueEmail,
        q1: "A",
        q2: "A",
        q3: "A",
        q4: "A",
        q5: "A",
        q6: "A",
        q7: "A",
        q8: "A",
        q9: "A",
        q10: "A",
        score: 20,
        category: "High Risk",
        diagnostic_result:
          "High technical debt, unmanaged assets, critical execution gaps.",
        redirect_target: "Deliver My Project",
        answers,
      });
    });
  });
  test.describe("Moderate Control (B/B/B)", () => {
    test("creates and persists with Moderate Control category", async ({
      request,
    }) => {
      const uniqueEmail = `ownership-moderate-${Date.now()}@example.com`;
      const answers = answersFor("B");
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: {
          fullName: "Moderate Control Test Visitor",
          visitorEmail: uniqueEmail,
          answers,
        },
      });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.data).toMatchObject({
        fullName: "Moderate Control Test Visitor",
        visitorEmail: uniqueEmail,
        answers,
        score: 50,
        category: "Moderate Control",
        diagnosticResult:
          "Functional foundation, but lacks automated governance and structure.",
        redirectTarget: "Mentor Me",
      });
      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
      const [persistedAudit] = await connection`
        SELECT
          id,
          full_name,
          visitor_email,
          q1,
          q2,
          q3,
          q4,
          q5,
          q6,
          q7,
          q8,
          q9,
          q10,
          score,
          category,
          diagnostic_result,
          redirect_target,
          answers
        FROM ownership_audits
        WHERE id = ${body.data.id}
        LIMIT 1
      `;
      expect(persistedAudit).toMatchObject({
        id: body.data.id,
        full_name: "Moderate Control Test Visitor",
        visitor_email: uniqueEmail,
        q1: "B",
        q2: "B",
        q3: "B",
        q4: "B",
        q5: "B",
        q6: "B",
        q7: "B",
        q8: "B",
        q9: "B",
        q10: "B",
        score: 50,
        category: "Moderate Control",
        diagnostic_result:
          "Functional foundation, but lacks automated governance and structure.",
        redirect_target: "Mentor Me",
        answers,
      });
    });
  });
  test.describe("Strong Ownership (C/C/C)", () => {
    test("creates and persists with Strong Ownership category", async ({
      request,
    }) => {
      const uniqueEmail = `ownership-strong-${Date.now()}@example.com`;
      const answers = answersFor("C");
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: {
          fullName: "Strong Ownership Test Visitor",
          visitorEmail: uniqueEmail,
          answers,
        },
      });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.data).toMatchObject({
        fullName: "Strong Ownership Test Visitor",
        visitorEmail: uniqueEmail,
        answers,
        score: 100,
        category: "Strong Ownership",
        diagnosticResult: "Highly mature, automated, and secure architecture.",
        redirectTarget: "Coffee With Me",
      });
      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
      const [persistedAudit] = await connection`
        SELECT
          id,
          full_name,
          visitor_email,
          q1,
          q2,
          q3,
          q4,
          q5,
          q6,
          q7,
          q8,
          q9,
          q10,
          score,
          category,
          diagnostic_result,
          redirect_target,
          answers
        FROM ownership_audits
        WHERE id = ${body.data.id}
        LIMIT 1
      `;
      expect(persistedAudit).toMatchObject({
        id: body.data.id,
        full_name: "Strong Ownership Test Visitor",
        visitor_email: uniqueEmail,
        q1: "C",
        q2: "C",
        q3: "C",
        q4: "C",
        q5: "C",
        q6: "C",
        q7: "C",
        q8: "C",
        q9: "C",
        q10: "C",
        score: 100,
        category: "Strong Ownership",
        diagnostic_result: "Highly mature, automated, and secure architecture.",
        redirect_target: "Coffee With Me",
        answers,
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
    test("rejects request with invalid visitor email type", async ({
      request,
    }) => {
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
      expect(body.error.message).toBe("A valid visitor email is required.");
    });
  });
});
