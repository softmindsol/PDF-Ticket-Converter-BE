import userModel from "#models/user.model.js";
import { verifyToken } from "#utils/auth.utils.js";
import ApiError from "#utils/api.utils.js";
import httpStatus from "http-status";

export const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "No token provided", [
          { token: "No token provided" },
        ]);
      }

      const token = authHeader.split(" ")[1];
      let decoded;

      try {
        decoded = verifyToken(token);
      } catch (err) {
        if (err.message === "TOKEN_EXPIRED") {
          return next(
            new ApiError(httpStatus.UNAUTHORIZED, "Token expired", [
              { token: "Token expired" },
            ])
          );
        }
        if (err.message === "INVALID_TOKEN") {
          return next(
            new ApiError(httpStatus.UNAUTHORIZED, "Invalid token", [
              { token: "Invalid token" },
            ])
          );
        }
        return next(
          new ApiError(httpStatus.UNAUTHORIZED, "Authentication Malfunction", [
            { token: "Authentication Malfunction" },
          ])
        );
      }

      const user = await userModel.findById(decoded.id).populate("department");
      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User not found", [
          { user: "User not found" },
        ]);
      }

      req.user = user;

      if (roles.length > 0 && !roles.includes(user.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Access denied", [
          { role: "Access denied" },
        ]);
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return next(error);
    }
  };
};
