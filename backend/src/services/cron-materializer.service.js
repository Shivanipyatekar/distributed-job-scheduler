import * as cronMaterializerRepository from "../repositories/cron-materializer.repository.js";

export const materializeDueCronSchedules = async ({
  limit = 25,
} = {}) => {
  return cronMaterializerRepository.materializeDueCronSchedules({
    limit,
  });
};
