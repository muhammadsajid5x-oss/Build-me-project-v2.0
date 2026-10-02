import { Router } from "express";

import { createFoundationCheckin } from "../services/foundation-checkin.js";
import {
  createValidationError,
  validateCreateFoundationCheckinRequest,
} from "../validators/index.js";

const router = Router();

router.post("/", (request, response) => {
  const result = validateCreateFoundationCheckinRequest(request.body);

  if (!result.success) {
    response.status(400).json(createValidationError(result.errors));
    return;
  }

  response
    .status(201)
    .json({ data: createFoundationCheckin(result.data.name) });
});

export default router;
