import { rateLimit } from "express-rate-limit";

const rateLimitMessage = {
  error: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests. Please try again later.",
  },
};

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: rateLimitMessage,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many authentication requests. Please try again later.",
    },
  },
});
