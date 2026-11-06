import { test, expect } from "@playwright/test";
import { connection } from "../../database/drizzle/client.js";
const apiUrl = "http://localhost:3000";
test.describe("Testimonials API Integration", () => {
  test.describe("Published testimonials", () => {
    test("returns published testimonials with pagination", async ({
      request,
    }) => {
      const response = await request.get(
        `${apiUrl}/api/v1/testimonials?page=1&limit=4`,
      );
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.pagination).toMatchObject({
        page: 1,
        limit: 4,
      });
      expect(body.pagination.total).toBeGreaterThan(0);
      expect(body.pagination.totalPages).toBeGreaterThan(0);
      for (const testimonial of body.data) {
        expect(testimonial).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          content: expect.any(String),
          rating: expect.any(Number),
          published: true,
        });
      }
    });
  });
  test.describe("Helpful count persistence", () => {
    test("increments and persists the helpful count", async ({ request }) => {
      const [testimonial] = await connection`
        SELECT
          id,
          helpful_count,
          published
        FROM testimonials
        WHERE published = true
        ORDER BY created_at ASC
        LIMIT 1
      `;
      expect(testimonial).toBeDefined();
      expect(testimonial.published).toBe(true);
      const initialHelpfulCount = Number(testimonial.helpful_count);
      const response = await request.post(
        `${apiUrl}/api/v1/testimonials/${testimonial.id}/helpful`,
      );
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data).toMatchObject({
        testimonialId: testimonial.id,
        helpfulCount: initialHelpfulCount + 1,
      });
      const [persistedTestimonial] = await connection`
        SELECT
          id,
          helpful_count,
          published
        FROM testimonials
        WHERE id = ${testimonial.id}
        LIMIT 1
      `;
      expect(persistedTestimonial).toMatchObject({
        id: testimonial.id,
        published: true,
      });
      expect(Number(persistedTestimonial.helpful_count)).toBe(
        initialHelpfulCount + 1,
      );
    });
  });
  test.describe("Published testimonial filtering", () => {
    test("does not return unpublished testimonials", async ({ request }) => {
      const response = await request.get(
        `${apiUrl}/api/v1/testimonials?page=1&limit=100`,
      );
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined();
      for (const testimonial of body.data) {
        expect(testimonial.published).toBe(true);
      }
    });
  });
});
