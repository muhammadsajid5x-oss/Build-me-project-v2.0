import { Router } from "express";

const router = Router();

router.get("/", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "build-me-api",
  });
});

export default router;
