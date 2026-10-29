import { describe, expect, it } from "vitest";

import { validateCreateCoffeeWithMeRequest } from "../../src/validators/index.js";

const validRequest = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  topic: "Product strategy",
  preferredFormat: "Video call",
  availability: "Weekday mornings",
};

describe("validateCreateCoffeeWithMeRequest", () => {
  it("accepts and trims a complete request", () => {
    const result = validateCreateCoffeeWithMeRequest({
      ...validRequest,
      name: "  Ada Lovelace  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validRequest);
    }
  });

  it("accepts a request without the optional preferredFormat and availability", () => {
    const result = validateCreateCoffeeWithMeRequest({
      name: validRequest.name,
      email: validRequest.email,
      topic: validRequest.topic,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferredFormat).toBeUndefined();
      expect(result.data.availability).toBeUndefined();
    }
  });

  it("rejects a non-object request body", () => {
    const result = validateCreateCoffeeWithMeRequest(null);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContainEqual({
        field: "body",
        message: "Request body must be an object.",
      });
    }
  });

  it("requires the name, email and topic", () => {
    const result = validateCreateCoffeeWithMeRequest({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { field: "name", message: "Name is required." },
          { field: "email", message: "Email is required." },
          { field: "topic", message: "Topic is required." },
        ]),
      );
    }
  });

  it("rejects an invalid email address", () => {
    const result = validateCreateCoffeeWithMeRequest({
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
    const result = validateCreateCoffeeWithMeRequest({
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

  it("rejects an oversized topic", () => {
    const result = validateCreateCoffeeWithMeRequest({
      ...validRequest,
      topic: "a".repeat(2001),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContainEqual({
        field: "topic",
        message: "Topic must be between 1 and 2000 characters.",
      });
    }
  });

  it("rejects an oversized optional preferredFormat", () => {
    const result = validateCreateCoffeeWithMeRequest({
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
    const result = validateCreateCoffeeWithMeRequest({
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
    const result = validateCreateCoffeeWithMeRequest({
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
    const result = validateCreateCoffeeWithMeRequest({
      name: "  Ada Lovelace  ",
      email: "  ada@example.com  ",
      topic: "  Product strategy  ",
      preferredFormat: "  Video call  ",
      availability: "  Weekday mornings  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Ada Lovelace");
      expect(result.data.email).toBe("ada@example.com");
      expect(result.data.topic).toBe("Product strategy");
      expect(result.data.preferredFormat).toBe("Video call");
      expect(result.data.availability).toBe("Weekday mornings");
    }
  });

  it("treats empty optional strings as undefined", () => {
    const result = validateCreateCoffeeWithMeRequest({
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