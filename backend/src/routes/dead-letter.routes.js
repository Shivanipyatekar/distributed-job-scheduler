import { Router } from "express";

import {
  getById,
  list,
  requeue,
} from "../controllers/dead-letter.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get(
  "/projects/:projectId/queues/:queueId/dead-letter",
  list,
);

router.get(
  "/projects/:projectId/queues/:queueId/dead-letter/:deadLetterId",
  getById,
);

router.post(
  "/projects/:projectId/queues/:queueId/dead-letter/:deadLetterId/requeue",
  requeue,
);

export default router;
