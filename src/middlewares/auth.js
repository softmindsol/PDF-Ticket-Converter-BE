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

      const user = await userModel
        .findById(decoded.id)
        .populate("department")
        .select("+status");

      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User not found", [
          { user: "User not found" },
        ]);
      }

      if (user.status === "inactive") {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Your account has been deactivated. Please contact an administrator.",
          [{ account: "User account is inactive" }]
        );
      }


       const tokenAllowedForms = decoded.allowedForms;
      const dbAllowedForms = user.department?.allowedForms;

      if (!areArraysEqual(tokenAllowedForms, dbAllowedForms)) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Your permissions have changed. Please log in again.",
          [{ auth: "Permissions mismatch" }]
        );
      }
      req.user = user;

      if (roles.length > 0 && !roles.includes(user.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Access denied.", [
          { role: "You do not have permission to perform this action." },
        ]);
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error.message);
      return next(error);
    }
  };
};


const areArraysEqual = (arr1 = [], arr2 = []) => {
  // Ensure both are arrays
  const a = Array.isArray(arr1) ? arr1 : [];
  const b = Array.isArray(arr2) ? arr2 : [];

  if (a.length !== b.length) {
    return false;
  }

  // Sort and compare
  const sortedArr1 = [...a].sort();
  const sortedArr2 = [...b].sort();

  return sortedArr1.every((value, index) => String(value) === String(sortedArr2[index]));
};

