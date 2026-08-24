import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getDashboardMetrics } from "../controllers/metrics.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/projects/:projectId/metrics",
  getDashboardMetrics,
);

export default router;
