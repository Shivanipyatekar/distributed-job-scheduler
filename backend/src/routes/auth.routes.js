import { Router } from "express";
import {
  register,
  login,
} from "../controllers/auth.controller.js";
import {
  registerValidator,
  loginValidator,
} from "../validators/auth.validator.js";
import { validateRequest } from "../middleware/validate-request.middleware.js";

const router = Router();

router.post(
  "/register",
  registerValidator,
  validateRequest,
  register
);

router.post(
  "/login",
  loginValidator,
  validateRequest,
  login
);

export default router;
