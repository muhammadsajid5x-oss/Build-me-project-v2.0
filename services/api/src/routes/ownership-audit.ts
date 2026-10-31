import { Router } from "express";

import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import {
  createOwnershipAudit,
  listOwnershipAudits,
  type CreateOwnershipAuditInput,
  type OwnershipAuditOption,
} from "../services/ownership-audit.js";

const router = Router();

const VALID_OPTIONS: OwnershipAuditOption[] = ["A", "B", "C"];
const QUESTION_KEYS = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
  "q7",
  "q8",
  "q9",
  "q10",
] as const;

function isOwnershipAuditOption(value: unknown): value is OwnershipAuditOption {
  return typeof value === "string" && VALID_OPTIONS.includes(value as OwnershipAuditOption);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

router.post("/", async (request, response, next) => {
  if (!request.body || typeof request.body !== "object") {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request body must be an object.",
      },
    });
    return;
  }

  const { fullName, visitorEmail } = request.body as Record<string, unknown>;

  if (!isNonEmptyString(fullName) || fullName.trim().length < 2) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Full name is required.",
      },
    });
    return;
  }

  if (!isNonEmptyString(visitorEmail) || !isValidEmail(visitorEmail.trim())) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "A valid visitor email is required.",
      },
    });
    return;
  }

  const answers = {} as CreateOwnershipAuditInput;

  for (const key of QUESTION_KEYS) {
    const value = (request.body as Record<string, unknown>)[key];

    if (!isOwnershipAuditOption(value)) {
      response.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "All ten audit answers are required and must be A, B, or C.",
        },
      });
      return;
    }

    answers[key] = value;
  }

  try {
    const created = await createOwnershipAudit({
      fullName: fullName.trim(),
      visitorEmail: visitorEmail.trim().toLowerCase(),
      q1: answers.q1,
      q2: answers.q2,
      q3: answers.q3,
      q4: answers.q4,
      q5: answers.q5,
      q6: answers.q6,
      q7: answers.q7,
      q8: answers.q8,
      q9: answers.q9,
      q10: answers.q10,
    });

    response.status(201).json({
      data: created,
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (_request, response, next) => {
    try {
      const audits = await listOwnershipAudits();

      response.status(200).json({
        data: audits,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
