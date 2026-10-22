import { rateLimit } from "express-rate-limit";
import { Router } from "express";

const router = Router();
const eventTypes: Record<string, "view" | "click"> = {
  "hero.viewed": "view",
  "hero.right.viewed": "view",
  "page.viewed": "view",
  "navbar.home.clicked": "click",
};
router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

router.post("/", async (request, response, next) => {
  if (typeof request.body !== "object" || request.body === null) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "The analytics event is invalid.",
      },
    });
    return;
  }

  const { name, path } = request.body;
  const expectedEventType =
    typeof name === "string" && Object.hasOwn(eventTypes, name)
      ? eventTypes[name]
      : undefined;
  const eventType = expectedEventType;
  const validViewPath =
    expectedEventType !== "view" ||
    (typeof path === "string" &&
      path.startsWith("/") &&
      !path.startsWith("//") &&
      path.length <= 2048);
  const validationDiagnostic = {
    name: typeof name === "string" ? name.slice(0, 128) : null,
    bodyType: typeof request.body,
    eventType:
      typeof request.body.eventType === "string"
        ? request.body.eventType.slice(0, 32)
        : null,
    expectedEventType: expectedEventType ?? null,
    path: typeof path === "string" ? path.slice(0, 2048) : null,
    validViewPath,
    eventTypeIsUndefined: request.body.eventType === undefined,
  };

  if (
    !expectedEventType ||
    (request.body.eventType !== undefined &&
      request.body.eventType !== expectedEventType) ||
    !validViewPath
  ) {
    console.warn(validationDiagnostic);
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "The analytics event is invalid.",
      },
      diagnostic: validationDiagnostic,
    });
    return;
  }

  try {
    const [{ db }, { analyticsEvents }] = await Promise.all([
      import("../../../../database/dist/drizzle/client.js"),
      import("../../../../database/dist/schema/analytics-events.js"),
    ]);

    await db.insert(analyticsEvents).values({
      name,
      eventType,
      properties:
        eventType === "click"
          ? { feature: "navbar", data: { destination: "/" } }
          : { feature: "page", data: { path } },
    });

    response.status(202).json({ data: { accepted: true } });
  } catch (error) {
    next(error);
  }
});

export default router;
