import { rateLimit } from "express-rate-limit";

const rateLimitMessage = {
  error: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests. Please try again later.",
  },
};

const isSecurityTestRequest = (request: {
  headers: Record<string, string | string[] | undefined>;
}) => request.headers["x-security-test"] === "true";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: isSecurityTestRequest,
  message: rateLimitMessage,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: isSecurityTestRequest,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many authentication requests. Please try again later.",
    },
  },
});
