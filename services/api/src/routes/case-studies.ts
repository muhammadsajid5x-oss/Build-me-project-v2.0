import { Router } from "express";
import { listPublishedCaseStudies } from "../services/case-studies.js";

const router = Router();

router.get("/", async (request, response, next) => {
  try {
    const page = Number.parseInt(String(request.query.page ?? "1"), 10);
    const limit = Number.parseInt(String(request.query.limit ?? "4"), 10);
    response.status(200).json(await listPublishedCaseStudies(page, limit));
  } catch (error) {
    next(error);
  }
});

export default router;
