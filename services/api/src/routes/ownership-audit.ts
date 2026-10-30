import { Router } from "express";

import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";
import {
  createOwnershipAudit,
  listOwnershipAudits,
  type OwnershipAuditOption,
} from "../services/ownership-audit.js";

const router = Router();

const VALID_OPTIONS: OwnershipAuditOption[] = ["A", "B", "C"];

function isOwnershipAuditOption(value: unknown): value is OwnershipAuditOption {
  return (
    typeof value === "string" &&
    VALID_OPTIONS.includes(value as OwnershipAuditOption)
  );
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

  const { step1, step2, step3, visitorEmail } = request.body;

  if (
    !isOwnershipAuditOption(step1) ||
    !isOwnershipAuditOption(step2) ||
    !isOwnershipAuditOption(step3)
  ) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "All three audit answers are required.",
      },
    });
    return;
  }

  if (
    visitorEmail !== undefined &&
    visitorEmail !== null &&
    typeof visitorEmail !== "string"
  ) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Visitor email must be a string.",
      },
    });
    return;
  }

  try {
    const created = await createOwnershipAudit({
      step1,
      step2,
      step3,
      ...(typeof visitorEmail === "string" && visitorEmail.trim()
        ? { visitorEmail: visitorEmail.trim() }
        : {}),
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
