import { test, expect } from "@playwright/test";
import { connection } from "../../database/drizzle/client.js";

const apiUrl = "http://localhost:3000";

test.describe("Coffee With Me API Integration", () => {
  test("creates and persists a Coffee With Me request in the database", async ({
    request,
  }) => {
    const uniqueEmail = `coffee-integration-${Date.now()}@example.com`;

    const payload = {
      name: "Ada Lovelace",
      email: uniqueEmail,
      topic: "Designing scalable systems for a growing startup.",
      preferredFormat: "Online call",
      availability: "Weekday evenings",
    };

    const response = await request.post(
      `${apiUrl}/api/v1/coffee-with-me-requests`,
      {
        data: payload,
      },
    );

    expect(response.status()).toBe(201);

    const body = await response.json();

    expect(body.data).toMatchObject({
      name: payload.name,
      email: payload.email,
      topic: payload.topic,
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
        topic,
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
      source: "coffee-with-me",
      status: "new",
      topic: payload.topic,
      preferred_format: payload.preferredFormat,
      availability: payload.availability,
    });
  });
});
