import { test, expect } from "@playwright/test";

const apiUrl = "http://localhost:3000";

test.describe("Case Studies API Integration", () => {
  test("returns published case studies with four-item pagination", async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/v1/case-studies?page=1&limit=4`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.pagination).toMatchObject({ page: 1, limit: 4 });
    expect(body.pagination.total).toBeGreaterThanOrEqual(0);
    expect(body.pagination.totalPages).toBeGreaterThanOrEqual(0);
    for (const study of body.data) {
      expect(study).toMatchObject({
        id: expect.any(String), company: expect.any(String), title: expect.any(String),
        summary: expect.any(String), outcome: expect.any(String), content: expect.any(String), published: true,
      });
    }
  });

  test("does not return unpublished case studies", async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/v1/case-studies?page=1&limit=100`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    for (const study of body.data) expect(study.published).toBe(true);
  });
});