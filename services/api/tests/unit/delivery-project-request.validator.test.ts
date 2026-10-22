import { describe, expect, it } from "vitest";

import { validateCreateDeliveryProjectRequest } from "../../src/validators/index.js";

const validRequest = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  projectDescription: "A delivery platform.",
  expectedOutcome: "A working platform.",
  timeline: "6 weeks",
  budget: "$1,000",
};

describe("validateCreateDeliveryProjectRequest", () => {
  it("accepts and trims a complete request", () => {
    const result = validateCreateDeliveryProjectRequest({
      ...validRequest,
      name: "  Ada Lovelace  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validRequest);
    }
  });

  it("accepts a request without the optional timeline and budget", () => {
    const result = validateCreateDeliveryProjectRequest({
      name: validRequest.name,
      email: validRequest.email,
      projectDescription: validRequest.projectDescription,
      expectedOutcome: validRequest.expectedOutcome,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.timeline).toBeUndefined();
      expect(result.data.budget).toBeUndefined();
    }
  });

  it("rejects a non-object request body", () => {
    const result = validateCreateDeliveryProjectRequest(null);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContainEqual({
        field: "body",
        message: "Request body must be an object.",
      });
    }
  });

  it("requires the name, email, description and outcome", () => {
    const result = validateCreateDeliveryProjectRequest({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { field: "name", message: "Name is required." },
          { field: "email", message: "Email is required." },
          {
            field: "projectDescription",
            message: "Project description is required.",
          },
          { field: "expectedOutcome", message: "Expected outcome is required." },
        ]),
      );
    }
  });

  it("rejects an invalid email address", () => {
    const result = validateCreateDeliveryProjectRequest({
      ...validRequest,
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContainEqual({
        field: "email",
        message: "Please enter a valid email address.",
      });
    }
  });

  it("rejects an oversized optional timeline and budget", () => {
    const result = validateCreateDeliveryProjectRequest({
      ...validRequest,
      timeline: "t".repeat(101),
      budget: "b".repeat(101),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContainEqual({
        field: "timeline",
        message: "Timeline must not exceed 100 characters.",
      });
      expect(result.errors).toContainEqual({
        field: "budget",
        message: "Budget must not exceed 100 characters.",
      });
    }
  });

  it("drops unknown client fields instead of trusting them", () => {
    const result = validateCreateDeliveryProjectRequest({
      ...validRequest,
      id: "client-id",
      source: "spoofed-source",
      status: "converted",
      createdAt: "1999-01-01T00:00:00.000Z",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validRequest);
      expect(result.data).not.toHaveProperty("id");
      expect(result.data).not.toHaveProperty("source");
      expect(result.data).not.toHaveProperty("status");
      expect(result.data).not.toHaveProperty("createdAt");
    }
  });
});
