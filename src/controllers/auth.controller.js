import { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import userModel from "../models/user.model.js";
import {
  comparePassword,
  generateAuthToken,
  hashPassword,
} from "#utils/auth.utils.js";
import ApiError from "#utils/api.utils.js";
import httpStatus from "http-status";

// -----------------login controller-----------------
const loginController = asyncHandler(async (req, res) => {
  const { username, password } = req.body;


  // --- User Authentication ---
  const user = await userModel
    .findOne({ username })
    .populate("department", "allowedForms")
    .select("+password");

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials.", [
      { user: "Invalid username or password" },
    ]);
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials.", [
      { user: "Invalid username or password" },
    ]);
  }

  // --- New Validation: Check for Department Assignment ---
  // If the user's role is 'user' or 'manager', they must be assigned to a department.
  if ((user.role === "user" || user.role === "manager") && !user.department) {
    throw new ApiError(
      httpStatus.FORBIDDEN, // 403 Forbidden is more appropriate than 401 Unauthorized here
      "You are not currently enrolled in any department. Please contact an administrator.",
      [{ department: "User is not assigned to a department" }]
    );
  }

  console.log("🚀 ~ user:", user);
  const token = await generateAuthToken(user);

  // --- Success Response ---
  return new ApiResponse(
    res,
    httpStatus.OK,
    { token, user_id: user._id, role: user.role },
    "Login successful."
  );
});

// ----------------- register controller -----------------
const registerController = asyncHandler(async (req, res) => {
  const { firstName, lastName, username, password, phoneNumber } = req.body;

  const existingUser = await userModel.findOne({ username });
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "Username already taken", [
      { username: "Username already taken" },
    ]);
  }

  const hashedPassword = await hashPassword(password);

  const user = await userModel.create({
    firstName,
    lastName,
    username,
    password: hashedPassword,
    phoneNumber,
  });

  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { _id: user._id },
    "User registered successfully"
  );
});

export { loginController, registerController };
