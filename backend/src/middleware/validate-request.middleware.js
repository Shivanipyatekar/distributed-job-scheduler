import { validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (validationErrors.isEmpty()) {
    return next();
  }

  const errors = validationErrors
    .array({ onlyFirstError: true })
    .map((error) => ({
      field: error.path,
      message: error.msg,
    }));

  return res.status(400).json({
    success: false,
    message: "Request validation failed",
    errors,
  });
};

export default validateRequest;
