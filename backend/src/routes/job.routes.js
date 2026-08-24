import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { create,list,getById,update,remove,createBatch,getExecutions,getLogs, } from "../controllers/job.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/projects/:projectId/queues/:queueId/jobs",
  create
);

router.post(
  "/projects/:projectId/queues/:queueId/jobs/batch",
  createBatch
);

router.get(
  "/projects/:projectId/queues/:queueId/jobs",
  list
);

router.get(
  "/projects/:projectId/queues/:queueId/jobs/:jobId",
  getById
);
router.get(
  "/projects/:projectId/queues/:queueId/jobs/:jobId/executions",
  getExecutions,
);

router.get(
  "/projects/:projectId/queues/:queueId/jobs/:jobId/logs",
  getLogs,
);
router.patch(
  "/projects/:projectId/queues/:queueId/jobs/:jobId",
  update
);

router.delete(
  "/projects/:projectId/queues/:queueId/jobs/:jobId",
  remove
);
export default router;
