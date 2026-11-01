import { Router } from "express";
import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import {
  createOwnershipAudit,
  listOwnershipAudits,
  type OwnershipAuditAnswers,
  type OwnershipAuditOption,
} from "../services/ownership-audit.js";
const router = Router();
const VALID_OPTIONS: OwnershipAuditOption[] = ["A", "B", "C"];
const ANSWER_KEYS = [
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
function isOwnershipAuditOption(
  value: unknown,
): value is OwnershipAuditOption {
  return (
    typeof value === "string" &&
    VALID_OPTIONS.includes(value as OwnershipAuditOption)
  );
}
function isAnswers(value: unknown): value is OwnershipAuditAnswers {
  if (!value || typeof value !== "object") {
    return false;
  }
  const answers = value as Record<string, unknown>;
  return ANSWER_KEYS.every((key) => isOwnershipAuditOption(answers[key]));
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
  const { fullName, visitorEmail, answers } = request.body;
  if (
    typeof fullName !== "string" ||
    fullName.trim().length < 2
  ) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Full name is required.",
      },
    });
    return;
  }
  if (
    typeof visitorEmail !== "string" ||
    !isValidEmail(visitorEmail.trim())
  ) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "A valid visitor email is required.",
      },
    });
    return;
  }
  if (!isAnswers(answers)) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "All ten audit answers are required.",
      },
    });
    return;
  }
  try {
    const created = await createOwnershipAudit({
      fullName: fullName.trim(),
      visitorEmail: visitorEmail.trim(),
      answers,
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
