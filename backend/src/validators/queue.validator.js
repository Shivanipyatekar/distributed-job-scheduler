import { body, param } from "express-validator";

export const projectQueueValidator = [
  param("projectId")
    .isUUID()
    .withMessage("A valid project ID is required"),
];

export const queueIdValidator = [
  param("queueId")
    .isUUID()
    .withMessage("A valid queue ID is required"),
];

export const createQueueValidator = [
  ...projectQueueValidator,

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Queue name is required")
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Queue name must be between 2 and 100 characters"
    ),

  body("concurrencyLimit")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage(
      "Concurrency limit must be between 1 and 1000"
    )
    .toInt(),

  body("priority")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Priority must be between 0 and 100")
    .toInt(),

  body("retryPolicy")
    .optional()
    .isObject()
    .withMessage("Retry policy must be an object"),

  body("retryPolicy.strategy")
    .optional()
    .isIn(["fixed", "linear", "exponential"])
    .withMessage(
      "Retry strategy must be fixed, linear, or exponential"
    ),

  body("retryPolicy.baseDelayMs")
    .optional()
    .isInt({ min: 0, max: 86400000 })
    .withMessage(
      "Base delay must be between 0 and 86400000 milliseconds"
    )
    .toInt(),

  body("retryPolicy.maxDelayMs")
    .optional()
    .isInt({ min: 0, max: 86400000 })
    .withMessage(
      "Maximum delay must be between 0 and 86400000 milliseconds"
    )
    .toInt()
    .custom((value, { req }) => {
      const baseDelay =
        req.body.retryPolicy?.baseDelayMs ?? 1000;

      if (value < baseDelay) {
        throw new Error(
          "Maximum delay cannot be less than base delay"
        );
      }

      return true;
    }),

  body("retryPolicy.maxAttempts")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage(
      "Maximum attempts must be between 1 and 100"
    )
    .toInt(),
];

export const updateQueueValidator = [
  ...queueIdValidator,

  body().custom((_, { req }) => {
    const retryPolicy = req.body.retryPolicy ?? {};

    const hasUpdate =
      req.body.name !== undefined ||
      req.body.concurrencyLimit !== undefined ||
      req.body.priority !== undefined ||
      retryPolicy.strategy !== undefined ||
      retryPolicy.baseDelayMs !== undefined ||
      retryPolicy.maxDelayMs !== undefined ||
      retryPolicy.maxAttempts !== undefined;

    if (!hasUpdate) {
      throw new Error("At least one queue field must be provided");
    }

    return true;
  }),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Queue name cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Queue name cannot exceed 100 characters"),

  body("concurrencyLimit")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("Concurrency limit must be between 1 and 1000"),

  body("priority")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Priority must be between 0 and 100"),

  body("retryPolicy.strategy")
    .optional()
    .isIn(["fixed", "linear", "exponential"])
    .withMessage("Retry strategy must be fixed, linear, or exponential"),

  body("retryPolicy.baseDelayMs")
    .optional()
    .isInt({ min: 0, max: 86400000 })
    .withMessage("Base delay must be between 0 and 86400000 milliseconds"),

  body("retryPolicy.maxDelayMs")
    .optional()
    .isInt({ min: 0, max: 86400000 })
    .withMessage("Maximum delay must be between 0 and 86400000 milliseconds"),

  body("retryPolicy.maxAttempts")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Maximum attempts must be between 1 and 100"),

  body("retryPolicy.maxDelayMs")
    .optional()
    .custom((maxDelayMs, { req }) => {
      const baseDelayMs = req.body.retryPolicy?.baseDelayMs;

      if (baseDelayMs !== undefined && maxDelayMs < baseDelayMs) {
        throw new Error(
          "Maximum delay must be greater than or equal to base delay"
        );
      }

      return true;
    }),
];
