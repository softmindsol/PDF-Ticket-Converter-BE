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
    .populate("department", "allowedForms name")
    .select("+password +status"); // Ensure 'status' is selected if it's excluded by default

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials.", [
      { user: "Invalid username or password" },
    ]);
  }

  // --- START: ADDED LOGIC ---
  // Check if the user's account is active before proceeding.
  if (user.status === "inactive") {
    throw new ApiError(
      httpStatus.FORBIDDEN, // 403 Forbidden is appropriate here
      "Your account is inactive. Please contact an administrator.",
      [{ account: "Account is inactive" }]
    );
  }
  // --- END: ADDED LOGIC ---

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
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid current password.", [
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

  const user = await userModel
    .findById(userId)
    .populate("department", "allowedForms name")
    .select("+password");

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid password.", [
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
  const token = await generateAuthToken(user);
  return new ApiResponse(
    res,
    httpStatus.OK,
    {token, username: user.username },
    "Username changed successfully."
  );
});

const changeProfilePictureController = asyncHandler(async (req, res) => {
  // 1. Check if the file was successfully uploaded by the middleware
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No file was uploaded. Please select a valid image.");
  }

  const userId = req.user._id;

  // 2. Find the user in the database
  const user = await userModel.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  }

  // 3. Get the URL of the uploaded file from req.file (provided by multer-s3)
  const newProfilePictureUrl = req.file.location;

  // 4. Update the user's profilePicture field and save the document
  user.profilePicture = newProfilePictureUrl;
  await user.save();

  // 5. Return a successful response with the new image URL
  return new ApiResponse(
    res,
    httpStatus.OK,
    { profilePicture: newProfilePictureUrl },
    "Profile picture updated successfully."
  );
});

export {
  loginController,
  registerController,
  changePasswordController,
  changeUsernameController,
  changeProfilePictureController
};
