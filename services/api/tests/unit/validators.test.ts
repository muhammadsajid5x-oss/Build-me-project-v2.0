import { describe, expect, it } from "vitest";
import {
  validateCreateProjectRequest,
  validateApiResponse,
} from "../../src/validators/index.js";
describe("API validation", () => {
  describe("validateCreateProjectRequest", () => {
    it("accepts a valid project request", () => {
      const result = validateCreateProjectRequest({
        name: "Build Me Foundation",
        description: "Initial development project.",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          name: "Build Me Foundation",
          description: "Initial development project.",
        });
      }
    });
    it("rejects a missing project name", () => {
      const result = validateCreateProjectRequest({
        description: "Project without a name.",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContainEqual({
          field: "name",
          message: "Name is required.",
        });
      }
    });
    it("rejects a non-object request body", () => {
      const result = validateCreateProjectRequest(null);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContainEqual({
          field: "body",
          message: "Request body must be an object.",
        });
      }
    });
    it("rejects an invalid description type", () => {
      const result = validateCreateProjectRequest({
        name: "Build Me",
        description: 123,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContainEqual({
          field: "description",
          message: "Description must be a string.",
        });
      }
    });
  });
  describe("validateApiResponse", () => {
    it("accepts a response containing data", () => {
      const result = validateApiResponse({
        data: {
          id: "project-1",
          name: "Build Me",
        },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data).toEqual({
          id: "project-1",
          name: "Build Me",
        });
      }
    });
    it("rejects a response without data", () => {
      const result = validateApiResponse({
        message: "Invalid response",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContainEqual({
          field: "data",
          message: "Response must contain a data property.",
        });
      }
    });
  });
});
