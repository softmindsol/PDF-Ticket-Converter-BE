import { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import userModel from "../models/user.model.js";
import {
  comparePassword,
  generateAuthToken,
  hashPassword,
} from "#utils/auth.utils.js";
import ApiError from "#utils/api.utils.js";
import httpStatus from "http-status";

const loginController = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

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

  if ((user.role === "user" || user.role === "manager") && !user.department) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not currently enrolled in any department. Please contact an administrator.",
      [{ department: "User is not assigned to a department" }]
    );
  }

  console.log("🚀 ~ user:", user);
  const token = await generateAuthToken(user);

  return new ApiResponse(
    res,
    httpStatus.OK,
    { token, user_id: user._id, role: user.role },
    "Login successful."
  );
});

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

const changePasswordController = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user._id;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "All password fields are required."
    );
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "New passwords do not match.", [
      { confirmPassword: "Passwords do not match" },
    ]);
  }

  const user = await userModel.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  }

  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid current password.", [
      { oldPassword: "The password you entered is incorrect" },
    ]);
  }

  if (oldPassword === newPassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "New password must be different from the old password.",
      [{ newPassword: "Cannot reuse the same password" }]
    );
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  return new ApiResponse(
    res,
    httpStatus.OK,
    {},
    "Password changed successfully."
  );
});

const changeUsernameController = asyncHandler(async (req, res) => {
  const { newUsername, password } = req.body;
  const userId = req.user._id;

  if (!newUsername || !password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "New username and your current password are required."
    );
  }

  const user = await userModel.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid password.", [
      { password: "The password you entered is incorrect" },
    ]);
  }

  if (user.username === newUsername) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "The new username must be different from your current one.",
      [{ newUsername: "This is already your username" }]
    );
  }

  const existingUser = await userModel.findOne({ username: newUsername });
  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "This username is already taken. Please choose another.",
      [{ newUsername: "Username is already in use" }]
    );
  }

  user.username = newUsername;
  await user.save();

  return new ApiResponse(
    res,
    httpStatus.OK,
    { username: user.username },
    "Username changed successfully."
  );
});

export { loginController, registerController, changePasswordController, changeUsernameController };
