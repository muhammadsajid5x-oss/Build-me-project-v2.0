import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { authenticateAccessToken } from "../auth/index.js";
import { createApiError } from "../validators/index.js";

function getBearerToken(request: Request): string | null {
  const authorization = request.header("authorization");
  if (!authorization) {
    return null;
  }
  const parts = authorization.trim().split(/\s+/);
  if (parts.length !== 2) {
    return null;
  }
  const [scheme, token] = parts;
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token;
}

export async function authenticate(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const accessToken = getBearerToken(request);
  if (!accessToken) {
    response
      .status(401)
      .json(createApiError("UNAUTHORIZED", "Authentication is required."));
    return;
  }
  try {
    const user = await authenticateAccessToken(accessToken);
    if (!user) {
      response
        .status(401)
        .json(createApiError("UNAUTHORIZED", "Authentication is required."));
      return;
    }
    request.user = user;
    next();
  } catch {
    response
      .status(401)
      .json(createApiError("UNAUTHORIZED", "Authentication is required."));
  }
}
