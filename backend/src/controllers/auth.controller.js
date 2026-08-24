import {
  registerUser,
  loginUser,
} from "../services/auth.service.js";
import asyncHandler from "../utils/async-handler.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const result = await registerUser({
    name,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await loginUser({
    email,
    password,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});
