import { test, expect } from "@playwright/test";
import { connection } from "../../database/drizzle/client.js";

const apiUrl = "http://localhost:3000";

function payload(answer: "A" | "B" | "C") {
  return {
    fullName: "Integration Test Visitor",
    visitorEmail: `ownership-${answer}-${Date.now()}@${Math.random().toString(36).slice(2)}.example.com`,
    q1: answer, q2: answer, q3: answer, q4: answer, q5: answer,
    q6: answer, q7: answer, q8: answer, q9: answer, q10: answer,
  };
}

function mixedPayload(answers: string[]) {
  return {
    fullName: "Boundary Test Visitor",
    visitorEmail: `ownership-boundary-${Date.now()}@${Math.random().toString(36).slice(2)}.example.com`,
    q1: answers[0], q2: answers[1], q3: answers[2], q4: answers[3], q5: answers[4],
    q6: answers[5], q7: answers[6], q8: answers[7], q9: answers[8], q10: answers[9],
  };
}

test.describe("Ownership Audit API Integration", () => {
  test("persists the minimum score: 20, High Risk, Deliver My Project", async ({ request }) => {
    const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, { data: payload("A") });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.data).toMatchObject({
      score: 20,
      category: "High Risk",
      diagnosticResult: "High technical debt, unmanaged assets, critical execution gaps.",
      redirectTarget: "Deliver My Project",
    });
    const [row] = await connection`SELECT full_name, visitor_email, q1, q10, score, category, redirect_target FROM ownership_audits WHERE id = ${body.data.id}`;
    expect(row).toMatchObject({
      full_name: "Integration Test Visitor",
      q1: "A",
      q10: "A",
      score: 20,
      category: "High Risk",
      redirect_target: "Deliver My Project",
    });
  });

  test("persists the maximum score: 100, Strong Ownership, Coffee With Me", async ({ request }) => {
    const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, { data: payload("C") });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.data.score).toBe(100);
    expect(body.data.category).toBe("Strong Ownership");
    expect(body.data.redirectTarget).toBe("Coffee With Me");
  });

  test("handles all four routing boundaries exactly", async ({ request }) => {
    const cases = [
      { answers: ["A","A","A","A","A","B","B","B","B","B"], score: 35, category: "High Risk", redirect: "Deliver My Project" },
      { answers: ["B","B","B","B","B","B","B","B","C","C"], score: 36, category: "Moderate Control", redirect: "Mentor Me" },
      { answers: ["A","A","B","B","B","C","C","C","C","C"], score: 69, category: "Moderate Control", redirect: "Mentor Me" },
      { answers: ["B","B","B","B","B","B","C","C","C","C"], score: 70, category: "Strong Ownership", redirect: "Coffee With Me" },
    ];

    for (const testCase of cases) {
      const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
        data: mixedPayload(testCase.answers),
      });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.data).toMatchObject({
        score: testCase.score,
        category: testCase.category,
        redirectTarget: testCase.redirect,
      });
    }
  });

  test("rejects missing visitor identity", async ({ request }) => {
    const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, {
      data: { ...payload("A"), fullName: "", visitorEmail: "not-an-email" },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
  });

  test("rejects missing or invalid question answers", async ({ request }) => {
    const invalid = payload("A");
    delete (invalid as Record<string, unknown>).q10;
    const response = await request.post(`${apiUrl}/api/v1/ownership-audits`, { data: invalid });
    expect(response.status()).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
  });
});
