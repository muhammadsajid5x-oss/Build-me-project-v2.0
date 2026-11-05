import { describe, expect, it } from "vitest";

import { validateCreateMentorMeRequest } from "../../src/validators/index.js";

const validRequest = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  mentoringArea: "Software Architecture",
  helpWith: "Designing scalable systems for a growing startup.",
  experienceContext: "5 years as a backend engineer, currently tech lead.",
  preferredFormat: "Online call",
  availability: "Weekday evenings",
};

describe("validateCreateMentorMeRequest", () => {
  it("accepts and trims a complete request", () => {
    const result = validateCreateMentorMeRequest({
      ...validRequest,
      name: "  Ada Lovelace  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validRequest);
    }
  });

  it("accepts a request without the optional preferredFormat and availability", () => {
    const result = validateCreateMentorMeRequest({
      name: validRequest.name,
      email: validRequest.email,
      mentoringArea: validRequest.mentoringArea,
      helpWith: validRequest.helpWith,
      experienceContext: validRequest.experienceContext,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferredFormat).toBeUndefined();
      expect(result.data.availability).toBeUndefined();
    }
  });

  it("rejects a non-object request body", () => {
    const result = validateCreateMentorMeRequest(null);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContainEqual({
        field: "body",
        message: "Request body must be an object.",
      });
    }
  });

  it("requires the name, email, mentoringArea, helpWith and experienceContext", () => {
    const result = validateCreateMentorMeRequest({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { field: "name", message: "Name is required." },
          { field: "email", message: "Email is required." },
          { field: "mentoringArea", message: "Mentoring area is required." },
          { field: "helpWith", message: "Please describe what you would like help with." },
          { field: "experienceContext", message: "Current experience or context is required." },
        ]),
      );
    }
  });

  it("rejects an invalid email address", () => {
    const result = validateCreateMentorMeRequest({
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

  it("rejects an oversized name", () => {
    const result = validateCreateMentorMeRequest({
      ...validRequest,
      name: "a".repeat(101),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContainEqual({
        field: "name",
        message: "Name must be between 1 and 100 characters.",
      });
    }
  });

  it("rejects an oversized mentoringArea", () => {
    const result = validateCreateMentorMeRequest({
      ...validRequest,
      mentoringArea: "a".repeat(101),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContainEqual({
        field: "mentoringArea",
        message: "Mentoring area must be between 1 and 100 characters.",
      });
    }
  });

  it("rejects an oversized helpWith", () => {
    const result = validateCreateMentorMeRequest({
      ...validRequest,
      helpWith: "a".repeat(2001),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContainEqual({
        field: "helpWith",
        message: "Help description must be between 1 and 2000 characters.",
      });
    }
  });

    it("rejects an oversized experienceContext", () => {
    const result = validateCreateMentorMeRequest({
      ...validRequest,
      experienceContext: "a".repeat(2001),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContainEqual({
        field: "experienceContext",
        message: "Experience or context must be between 1 and 2000 characters.",
      });
    }
  });

  it("rejects an oversized optional preferredFormat", () => {
    const result = validateCreateMentorMeRequest({
      ...validRequest,
      preferredFormat: "a".repeat(101),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContainEqual({
        field: "preferredFormat",
        message: "Preferred format must not exceed 100 characters.",
      });
    }
  });

  it("rejects an oversized optional availability", () => {
    const result = validateCreateMentorMeRequest({
      ...validRequest,
      availability: "a".repeat(101),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContainEqual({
        field: "availability",
        message: "Availability must not exceed 100 characters.",
      });
    }
  });

  it("drops unknown client fields instead of trusting them", () => {
    const result = validateCreateMentorMeRequest({
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

  it("sanitizes strings by trimming whitespace", () => {
    const result = validateCreateMentorMeRequest({
      name: "  Ada Lovelace  ",
      email: "  ada@example.com  ",
      mentoringArea: "  Software Architecture  ",
      helpWith: "  Designing scalable systems  ",
      experienceContext: "  5 years experience  ",
      preferredFormat: "  Online call  ",
      availability: "  Weekday evenings  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Ada Lovelace");
      expect(result.data.email).toBe("ada@example.com");
      expect(result.data.mentoringArea).toBe("Software Architecture");
      expect(result.data.helpWith).toBe("Designing scalable systems");
      expect(result.data.experienceContext).toBe("5 years experience");
      expect(result.data.preferredFormat).toBe("Online call");
      expect(result.data.availability).toBe("Weekday evenings");
    }
  });

  it("treats empty optional strings as undefined", () => {
    const result = validateCreateMentorMeRequest({
      ...validRequest,
      preferredFormat: "   ",
      availability: "   ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferredFormat).toBeUndefined();
      expect(result.data.availability).toBeUndefined();
    }
  });
});