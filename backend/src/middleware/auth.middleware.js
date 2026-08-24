import { verifyToken } from "../utils/jwt.js";
import AppError from "../utils/app-error.js";

export const authenticate = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return next(
      new AppError("Authentication token is required", 401)
    );
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return next(
      new AppError(
        "Use the Authorization header with a Bearer token",
        401
      )
    );
  }

  try {
    const payload = verifyToken(token);

    req.user = {
      id: payload.userId,
    };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError("Authentication token has expired", 401)
      );
    }

    return next(
      new AppError("Authentication token is invalid", 401)
    );
  }
};

export default authenticate;
