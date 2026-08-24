import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getById,
  list,
} from "../controllers/worker-monitoring.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/projects/:projectId/workers",
  list,
);

router.get(
  "/projects/:projectId/workers/:workerId",
  getById,
);

export default router;
