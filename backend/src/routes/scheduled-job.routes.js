import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  activate,
  create,
  deactivate,
  getById,
  list,
  remove,
  update,
} from "../controllers/scheduled-job.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/projects/:projectId/queues/:queueId/cron-schedules",
  create,
);

router.get(
  "/projects/:projectId/queues/:queueId/cron-schedules",
  list,
);

router.get(
  "/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId",
  getById,
);

router.patch(
  "/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId",
  update,
);

router.post(
  "/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId/activate",
  activate,
);

router.post(
  "/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId/deactivate",
  deactivate,
);

router.delete(
  "/projects/:projectId/queues/:queueId/cron-schedules/:scheduleId",
  remove,
);

export default router;
