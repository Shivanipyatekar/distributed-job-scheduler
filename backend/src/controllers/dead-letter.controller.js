import {
  getDeadLetterEntry,
  listDeadLetterEntries,
  requeueDeadLetterJob,
} from "../services/dead-letter.service.js";

export const list = async (req, res, next) => {
  const result = await listDeadLetterEntries({
    projectId: req.params.projectId,
    queueId: req.params.queueId,
    userId: req.user.id,
    query: req.query,
  });

  return res.status(200).json({
    success: true,
    message:
      "Dead-letter entries retrieved successfully",
    data: result.entries,
    pagination: result.pagination,
  });
};

export const getById = async (
  req,
  res,
  next,
) => {
  const entry = await getDeadLetterEntry({
    deadLetterId: req.params.deadLetterId,
    projectId: req.params.projectId,
    queueId: req.params.queueId,
    userId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message:
      "Dead-letter entry retrieved successfully",
    data: entry,
  });
};

export const requeue = async (
  req,
  res,
  next,
) => {
  const result = await requeueDeadLetterJob({
    deadLetterId: req.params.deadLetterId,
    projectId: req.params.projectId,
    queueId: req.params.queueId,
    userId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message: "Dead-letter job requeued successfully",
    data: result,
  });
};
