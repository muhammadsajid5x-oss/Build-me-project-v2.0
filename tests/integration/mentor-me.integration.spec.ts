import { test, expect } from "@playwright/test";
import { connection } from "../../database/drizzle/client.js";
const apiUrl = "http://localhost:3000";
test.describe("Mentor Me API Integration", () => {
  test("creates and persists a Mentor Me request in the database", async ({
    request,
  }) => {
    const uniqueEmail = `mentor-integration-${Date.now()}@example.com`;
    const payload = {
      name: "Ada Lovelace",
      email: uniqueEmail,
      mentoringArea: "Software Architecture",
      helpWith: "Designing scalable systems for a growing startup.",
      experienceContext:
        "5 years as a backend engineer, currently tech lead.",
      preferredFormat: "Online call",
      availability: "Weekday evenings",
    };
    const response = await request.post(
      `${apiUrl}/api/v1/mentor-me-requests`,
      {
        data: payload,
      },
    );
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.data).toMatchObject({
      name: payload.name,
      email: payload.email,
      mentoringArea: payload.mentoringArea,
      helpWith: payload.helpWith,
      experienceContext: payload.experienceContext,
      preferredFormat: payload.preferredFormat,
      availability: payload.availability,
      status: "new",
    });
    expect(body.data.id).toBeDefined();
    const [persistedLead] = await connection`
      SELECT
        id,
        name,
        email,
        source,
        status,
        mentoring_area,
        help_with,
        experience_context,
        preferred_format,
        availability
      FROM leads
      WHERE id = ${body.data.id}
      LIMIT 1
    `;
    expect(persistedLead).toBeDefined();
    expect(persistedLead).toMatchObject({
      id: body.data.id,
      name: payload.name,
      email: uniqueEmail,
      source: "mentor-me",
      status: "new",
      mentoring_area: payload.mentoringArea,
      help_with: payload.helpWith,
      experience_context: payload.experienceContext,
      preferred_format: payload.preferredFormat,
      availability: payload.availability,
    });
  });
});
