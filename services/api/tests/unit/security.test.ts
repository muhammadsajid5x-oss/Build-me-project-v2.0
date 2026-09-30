import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { securityHeaders } from "../../src/middleware/security.js";
import { authorize } from "../../src/middleware/authorize.js";
import { errorHandler } from "../../src/middleware/error-handler.js";
import { PERMISSIONS } from "../../src/permissions/index.js";
import {
  sanitizeOptionalString,
  sanitizeString,
} from "../../src/validators/sanitize.js";

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
    getHeader: vi.fn(),
    removeHeader: vi.fn(),
    end: vi.fn(),
  } as unknown as Response;
}

function createRequest(): Request {
  return {} as Request;
}

describe("Backend Security Foundation", () => {
  describe("Input sanitisation", () => {
    it("trims untrusted strings", () => {
      expect(sanitizeString("  hello  ")).toBe("hello");
    });

    it("returns an empty string for non-string input", () => {
      expect(sanitizeString(123)).toBe("");
    });

    it("sanitises optional strings", () => {
      expect(sanitizeOptionalString("  hello  ")).toBe("hello");
      expect(sanitizeOptionalString("   ")).toBeUndefined();
      expect(sanitizeOptionalString(undefined)).toBeUndefined();
      expect(sanitizeOptionalString(null)).toBeUndefined();
    });
  });

  describe("Authorisation", () => {
    it("returns 401 when no authenticated user exists", () => {
      const request = createRequest();
      const response = createResponse();
      const next = vi.fn() as unknown as NextFunction;

      authorize(PERMISSIONS.AUTHENTICATED)(request, response, next);

      expect(response.status).toHaveBeenCalledWith(401);
      expect(response.json).toHaveBeenCalledWith({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("allows an authenticated user with the authenticated permission", () => {
      const request = createRequest();

      request.user = {
        id: "user-123",
        email: "user@example.com",
        isAdmin: false,
      };

      const response = createResponse();
      const next = vi.fn() as unknown as NextFunction;

      authorize(PERMISSIONS.AUTHENTICATED)(request, response, next);

      expect(next).toHaveBeenCalledOnce();
      expect(response.status).not.toHaveBeenCalled();
    });

    it("returns 403 when an authenticated user lacks a permission", () => {
      const request = createRequest();

      request.user = {
        id: "user-123",
        email: "user@example.com",
        isAdmin: false,
      };

      const response = createResponse();
      const next = vi.fn() as unknown as NextFunction;

      authorize("projects.manage" as Parameters<typeof authorize>[0])(
        request,
        response,
        next,
      );

      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.json).toHaveBeenCalledWith({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource.",
        },
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("Safe error handling", () => {
    it("returns a generic error without exposing internal details", () => {
      const request = createRequest();
      const response = createResponse();
      const next = vi.fn() as unknown as NextFunction;

      const internalError = new Error(
        "Database connection failed: password mismatch at line 42",
      );

      errorHandler(internalError, request, response, next);

      expect(response.status).toHaveBeenCalledWith(500);

      const responseBody = (response.json as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0];

      expect(responseBody).toEqual({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      });

      expect(JSON.stringify(responseBody)).not.toContain("password mismatch");

      expect(JSON.stringify(responseBody)).not.toContain("stack");
    });
    describe("Secure headers", () => {
      it("adds security headers to responses", () => {
        const request = createRequest();
        const response = createResponse();
        const next = vi.fn() as unknown as NextFunction;

        securityHeaders(request, response, next);

        expect(response.setHeader).toHaveBeenCalledWith(
          "X-Content-Type-Options",
          "nosniff",
        );

        expect(response.setHeader).toHaveBeenCalledWith(
          "X-Frame-Options",
          "SAMEORIGIN",
        );

        expect(next).toHaveBeenCalledOnce();
      });
    });
  });
});
