import { Router } from "express";
import {
  createQueue,
  getQueues,
  getQueue,
  updateQueue,
pauseQueue,
resumeQueue,
getQueueStatistics,
deleteQueue,
} from "../controllers/queue.controller.js";
import {
  createQueueValidator,
  projectQueueValidator,
  queueIdValidator,
  updateQueueValidator,
} from "../validators/queue.validator.js";
import authenticate from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validate-request.middleware.js";

const router = Router();

router.use(authenticate);

router.post(
  "/projects/:projectId/queues",
  createQueueValidator,
  validateRequest,
  createQueue
);

router.get(
  "/projects/:projectId/queues",
  projectQueueValidator,
  validateRequest,
  getQueues
);

router.get(
  "/queues/:queueId",
  queueIdValidator,
  validateRequest,
  getQueue
);

router.get(
  "/queues/:queueId/statistics",
  queueIdValidator,
  validateRequest,
  getQueueStatistics
);

router.patch(
  "/queues/:queueId",
  updateQueueValidator,
  validateRequest,
  updateQueue
);

router.post(
  "/queues/:queueId/pause",
  queueIdValidator,
  validateRequest,
  pauseQueue
);

router.post(
  "/queues/:queueId/resume",
  queueIdValidator,
  validateRequest,
  resumeQueue
);

router.delete(
  "/queues/:queueId",
  queueIdValidator,
  validateRequest,
  deleteQueue
);

export default router;
