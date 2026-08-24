import {
  createQueue as createQueueService,
  getProjectQueues,
  getQueueById,
  updateQueue as updateQueueService,
  pauseQueue as pauseQueueService,
resumeQueue as resumeQueueService,
 getQueueStatistics as getQueueStatisticsService,
deleteQueue as deleteQueueService,
} from "../services/queue.service.js";
import asyncHandler from "../utils/async-handler.js";

export const createQueue = asyncHandler(
  async (req, res) => {
    const queue = await createQueueService({
      projectId: req.params.projectId,
      userId: req.user.id,
      name: req.body.name,
      concurrencyLimit: req.body.concurrencyLimit,
      priority: req.body.priority,
      retryPolicy: req.body.retryPolicy,
    });

    res.status(201).json({
      success: true,
      message: "Queue created successfully",
      data: {
        queue,
      },
    });
  }
);

export const getQueues = asyncHandler(
  async (req, res) => {
    const queues = await getProjectQueues({
      projectId: req.params.projectId,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Queues retrieved successfully",
      data: {
        queues,
      },
    });
  }
);

export const getQueue = asyncHandler(
  async (req, res) => {
    const queue = await getQueueById({
      queueId: req.params.queueId,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Queue retrieved successfully",
      data: {
        queue,
      },
    });
  }
);

export const updateQueue = asyncHandler(async (req, res) => {
  const queue = await updateQueueService(
    req.params.queueId,
    req.user.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Queue updated successfully",
    data: {
      queue,
    },
  });
});

export const pauseQueue = asyncHandler(async (req, res) => {
  const queue = await pauseQueueService(
    req.params.queueId,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: "Queue paused successfully",
    data: {
      queue,
    },
  });
});

export const resumeQueue = asyncHandler(async (req, res) => {
  const queue = await resumeQueueService(
    req.params.queueId,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: "Queue resumed successfully",
    data: {
      queue,
    },
  });
});

export const getQueueStatistics = asyncHandler(async (req, res) => {
  const statistics = await getQueueStatisticsService(
    req.params.queueId,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: "Queue statistics retrieved successfully",
    data: {
      statistics,
    },
  });
});


export const deleteQueue = asyncHandler(async (req, res) => {
  const queue = await deleteQueueService(
    req.params.queueId,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: "Queue deleted successfully",
    data: {
      queue,
    },
  });
});
