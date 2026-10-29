import { rateLimit } from "express-rate-limit";
import { Router } from "express";

const router = Router();
type AnalyticsEventType = "view" | "click";
type AnalyticsEventDefinition = {
  readonly eventType: AnalyticsEventType;
  readonly buildProperties: (path?: string) => Record<string, unknown>;
};
const pageViewProperties = (path?: string): Record<string, unknown> => ({
  feature: "page",
  data: { path },
});
const deliveryProjectProperties = (): Record<string, unknown> => ({
  feature: "deliver-my-project",
  data: { destination: "/deliver-my-project" },
});
const coffeeWithMeProperties = (): Record<string, unknown> => ({
  feature: "coffee-with-me",
  data: { destination: "/coffee-with-me" },
});
const eventDefinitions: Record<string, AnalyticsEventDefinition> = {
  "hero.viewed": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },
  "mentor.me.clicked": {
    eventType: "click",
    buildProperties: () => ({
      feature: "mentor-me",
      data: { action: "clicked" },
    }),
  },
  "mentor.me.viewed": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },
  "mentor.me.submitted": {
    eventType: "click",
    buildProperties: () => ({
      feature: "mentor-me",
      data: { action: "submitted" },
    }),
  },
  "mentor.me.completed": {
    eventType: "click",
    buildProperties: () => ({
      feature: "mentor-me",
      data: { action: "completed" },
    }),
  },
  "hero.right.viewed": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },
  "page.viewed": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },
  "coffee.with.me.viewed": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },
  "navbar.home.clicked": {
    eventType: "click",
    buildProperties: () => ({
      feature: "navbar",
      data: { destination: "/" },
    }),
  },
  "work.with.me.clicked": {
    eventType: "click",
    buildProperties: deliveryProjectProperties,
  },
  "coffee.with.me.clicked": {
    eventType: "click",
    buildProperties: coffeeWithMeProperties,
  },
  "coffee.with.me.submitted": {
    eventType: "click",
    buildProperties: () => ({
      feature: "coffee-with-me",
      data: { action: "submitted" },
    }),
  },
  "coffee.with.me.completed": {
    eventType: "click",
    buildProperties: () => ({
      feature: "coffee-with-me",
      data: { action: "completed" },
    }),
  },
  "deliver.my.project.clicked": {
    eventType: "click",
    buildProperties: deliveryProjectProperties,
  },
  "deliver.my.project.viewed": {
    eventType: "view",
    buildProperties: pageViewProperties,
  },
  "deliver.my.project.completed": {
    eventType: "click",
    buildProperties: deliveryProjectProperties,
  },
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
  const eventDefinition =
    typeof name === "string" && Object.hasOwn(eventDefinitions, name)
      ? eventDefinitions[name]
      : undefined;
  const expectedEventType = eventDefinition?.eventType;
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
      properties: eventDefinition?.buildProperties(path) ?? {},
    });

    response.status(202).json({ data: { accepted: true } });
  } catch (error) {
    next(error);
  }
});

export default router;
