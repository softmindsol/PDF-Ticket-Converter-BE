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

      // Fetch the user, ensuring the 'status' field is included
      const user = await userModel
        .findById(decoded.id)
        .populate("department")
        .select("+status"); // <-- IMPORTANT: Explicitly select status

      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User not found", [
          { user: "User not found" },
        ]);
      }

      // --- START: ADDED LOGIC ---
      // Check if the user's account is active on every request
      if (user.status === "inactive") {
        throw new ApiError(
          httpStatus.FORBIDDEN, // 403 Forbidden is correct: we know who they are, but they are not allowed access.
          "Your account has been deactivated. Please contact an administrator.",
          [{ account: "User account is inactive" }]
        );
      }
      // --- END: ADDED LOGIC ---

      req.user = user;

      // Check for role-based access
      if (roles.length > 0 && !roles.includes(user.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Access denied.", [
          { role: "You do not have permission to perform this action." },
        ]);
      }

      next();
    } catch (error) {
      // It's good practice to avoid logging the full error in production
      // for security reasons, but it's fine for development.
      console.error("Auth middleware error:", error.message);
      return next(error);
    }
  };
};
