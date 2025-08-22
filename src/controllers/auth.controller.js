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

  if (!username || !password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Username and password are required",
      [{ username: "Username is required", password: "Password is required" }]
    );
  }

  const user = await userModel.findOne({ username }).select("+password");
  if (!user) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Invalid username",
      [{ username: "Invalid username" }]
    );
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Invalid password",
      [{ password: "Invalid password" }]
    );
  }

  const token = await generateAuthToken(user);

  return new ApiResponse(res,httpStatus.OK, { token }, "Login successful");
});

// -----------------register controller-----------------
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
