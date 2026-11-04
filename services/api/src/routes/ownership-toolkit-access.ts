import { Router, type Request, type Response } from "express";

import { authenticate, authorize } from "../middleware/index.js";
import { PERMISSIONS } from "../permissions/index.js";

import {
  createOwnershipToolkitAccess,
  listOwnershipToolkitAccesses,
} from "../services/ownership-toolkit-access.js";

const router = Router();

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Public: record a visitor's access to the Ownership Toolkit.
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        error: "Invalid request body.",
      });
    }

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    const visitorEmail =
      typeof body.visitorEmail === "string"
        ? body.visitorEmail.trim().toLowerCase()
        : "";

    if (fullName.length < 2) {
      return res.status(400).json({
        error: "Please provide a valid full name.",
      });
    }

    if (!isValidEmail(visitorEmail)) {
      return res.status(400).json({
        error: "Please provide a valid email address.",
      });
    }

    const created = await createOwnershipToolkitAccess({
      fullName,
      visitorEmail,
    });

    return res.status(201).json({
      data: created,
    });
  } catch (error) {
    console.error("Failed to create Ownership Toolkit access:", error);

    return res.status(500).json({
      error: "Unable to record Ownership Toolkit access.",
    });
  }
});

// Admin only: retrieve Toolkit access records.
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.ADMIN),
  async (_req: Request, res: Response) => {
    try {
      const accesses = await listOwnershipToolkitAccesses();

      return res.status(200).json({
        data: accesses,
      });
    } catch (error) {
      console.error("Failed to retrieve Ownership Toolkit accesses:", error);

      return res.status(500).json({
        error: "Unable to retrieve Ownership Toolkit accesses.",
      });
    }
  },
);

export default router;
