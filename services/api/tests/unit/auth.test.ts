import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { authenticate } from "../../src/middleware/authenticate.js";
import { authorize } from "../../src/middleware/authorize.js";
import { PERMISSIONS } from "../../src/permissions/index.js";
import { authenticateAccessToken } from "../../src/auth/auth.service.js";
vi.mock("../../src/auth/auth.service.js", () => ({
  authenticateAccessToken: vi.fn(),
}));
const mockedAuthenticateAccessToken = vi.mocked(authenticateAccessToken);
function createResponse() {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return response;
}
function createRequest(authorization?: string): Request {
  return {
    header: vi.fn().mockReturnValue(authorization),
  } as unknown as Request;
}
describe("Authentication and authorisation foundation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe("authenticate", () => {
    it("rejects a request without an authorization header", async () => {
      const request = createRequest();
      const response = createResponse();
      const next = vi.fn() as unknown as NextFunction;
      await authenticate(request, response, next);
      expect(response.status).toHaveBeenCalledWith(401);
      expect(response.json).toHaveBeenCalledWith({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
        },
      });
      expect(next).not.toHaveBeenCalled();
      expect(mockedAuthenticateAccessToken).not.toHaveBeenCalled();
    });
    it("rejects a malformed authorization header", async () => {
      const request = createRequest("Basic invalid-token");
      const response = createResponse();
      const next = vi.fn() as unknown as NextFunction;
      await authenticate(request, response, next);
      expect(response.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
      expect(mockedAuthenticateAccessToken).not.toHaveBeenCalled();
    });
    it("rejects an invalid access token", async () => {
      mockedAuthenticateAccessToken.mockResolvedValue(null);
      const request = createRequest("Bearer invalid-token");
      const response = createResponse();
      const next = vi.fn() as unknown as NextFunction;
      await authenticate(request, response, next);
      expect(mockedAuthenticateAccessToken).toHaveBeenCalledWith(
        "invalid-token",
      );
      expect(response.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
    it("attaches the authenticated user to the request", async () => {
      mockedAuthenticateAccessToken.mockResolvedValue({
        id: "user-123",
        email: "user@example.com",
        isAdmin: false,
      });
      const request = createRequest("Bearer valid-token");
      const response = createResponse();
      const next = vi.fn() as unknown as NextFunction;
      await authenticate(request, response, next);
      expect(request.user).toEqual({
        id: "user-123",
        email: "user@example.com",
        isAdmin: false,
      });
      expect(next).toHaveBeenCalledOnce();
      expect(response.status).not.toHaveBeenCalled();
    });
    it("returns a secure 401 when authentication fails unexpectedly", async () => {
      mockedAuthenticateAccessToken.mockRejectedValue(
        new Error("internal Supabase error"),
      );
      const request = createRequest("Bearer token");
      const response = createResponse();
      const next = vi.fn() as unknown as NextFunction;
      await authenticate(request, response, next);
      expect(response.status).toHaveBeenCalledWith(401);
      expect(response.json).toHaveBeenCalledWith({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
        },
      });
      expect(next).not.toHaveBeenCalled();
      const responseBody = response.json.mock.calls[0]?.[0];
      expect(JSON.stringify(responseBody)).not.toContain(
        "internal Supabase error",
      );
    });
  });
  describe("authorize", () => {
    it("rejects unauthenticated requests with 401", () => {
      const request = createRequest();
      const response = createResponse();
      const next = vi.fn() as unknown as NextFunction;
      authorize(PERMISSIONS.AUTHENTICATED)(request, response, next);
      expect(response.status).toHaveBeenCalledWith(401);
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

    it("allows an admin with the admin permission", () => {
      const request = createRequest();
      request.user = { id: "admin-1", isAdmin: true };
      const response = createResponse();
      const next = vi.fn() as unknown as NextFunction;

      authorize(PERMISSIONS.ADMIN)(request, response, next);

      expect(next).toHaveBeenCalledOnce();
      expect(response.status).not.toHaveBeenCalled();
    });

    it("rejects a non-admin with the admin permission", () => {
      const request = createRequest();
      request.user = { id: "user-123", isAdmin: false };
      const response = createResponse();
      const next = vi.fn() as unknown as NextFunction;

      authorize(PERMISSIONS.ADMIN)(request, response, next);

      expect(response.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
