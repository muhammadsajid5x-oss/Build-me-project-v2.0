import express from "express";
import ownershipAuditRoutes from "./routes/ownership-audit.js";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import analyticsEventRoutes from "./routes/analytics-events.js";
import analyticsSummaryRoutes from "./routes/analytics-summary.js";
import coffeeWithMeRoutes from "./routes/coffee-with-me.js";
import deliveryProjectRequestRoutes from "./routes/delivery-project-requests.js";
import foundationCheckinRoutes from "./routes/foundation-checkins.js";
import healthRoutes from "./routes/health.js";
import mentorMeRoutes from "./routes/mentor-me.js";
import notificationRoutes from "./routes/notifications.js";
import ownershipToolkitAccessRoutes from "./routes/ownership-toolkit-access.js";
import testimonialsRoutes from "./routes/testimonials.js";
import caseStudiesRoutes from "./routes/case-studies.js";
import ownershipLearningCircleRoutes from "./routes/ownership-learning-circle.js";
import {
  apiRateLimiter,
  errorHandler,
  securityHeaders,
} from "./middleware/index.js";
import servicePlansRoutes from "./routes/service-plans.js";
import bookingRoutes from "./routes/bookings.js";
import invoiceRoutes from "./routes/invoices.js";

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(securityHeaders);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use("/health", healthRoutes);
app.use(apiRateLimiter);
app.get("/", (_req, res) =>
  res.json({ name: "Build Me API", status: "running" }),
);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/analytics/events", analyticsEventRoutes);
app.use("/api/v1/analytics/summary", analyticsSummaryRoutes);
app.use("/api/v1/foundation-checkins", foundationCheckinRoutes);
app.use("/api/v1/delivery-project-requests", deliveryProjectRequestRoutes);
app.use("/api/v1/mentor-me-requests", mentorMeRoutes);
app.use("/api/v1/coffee-with-me-requests", coffeeWithMeRoutes);
app.use("/api/v1/ownership-audits", ownershipAuditRoutes);
app.use("/api/v1/ownership-toolkit-accesses", ownershipToolkitAccessRoutes);
app.use(
  "/api/v1/ownership-learning-circle-requests",
  ownershipLearningCircleRoutes,
);
app.use("/api/v1/testimonials", testimonialsRoutes);
app.use("/api/v1/case-studies", caseStudiesRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/service-plans", servicePlansRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/invoices", invoiceRoutes);

app.use((_request, _response, next) => {
  next(new Error("NOT_FOUND"));
});

app.use(errorHandler);

export default app;
