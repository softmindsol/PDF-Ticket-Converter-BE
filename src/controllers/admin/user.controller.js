import userModel from "#models/user.model.js";
import { hashPassword } from "#utils/auth.utils.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";

const createUser = asyncHandler(async (req, res) => {
  const {department, username, password, firstName, lastName, role = "user", email } = req.body;

  if (!["user", "manager"].includes(role)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user role specified.");
  }

  const existingUser = await userModel.findOne({ username });
  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A user with this username already exists.",
      [{ username: "Username is already taken" }]
    );
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await userModel.create({
    username,
    password: hashedPassword,
    firstName,
    lastName,
    role,
    department
  });

  const userResponse = newUser.toObject();
  delete userResponse.password;

  const roleName = role.charAt(0).toUpperCase() + role.slice(1);

  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { user: userResponse },
    `${roleName} created successfully.`
  );
});

const getUsers = asyncHandler(async (req, res) => {
  const searchableFields = ["firstName", "lastName", "username", "email"];

  const features = new ApiFeatures(
    userModel.find().select("-password"),
    req.query
  )
  .filter(searchableFields)
  .sort()
  .limitFields();

  const { documents: users, pagination } = await features.execute();

  return new ApiResponse(
    res,
    httpStatus.OK,
    { users, pagination },
    "Users retrieved successfully."
  );
});
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    username,
    email,
    phoneNumber,
    status,
    department,
    isDeleted,
    password,
    role,
  } = req.body;

  if (username) {
    const existingUser = await userModel.findOne({ username });
    if (existingUser && existingUser._id.toString() !== id) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "This username is already in use by another account.",
        [{ username: "Username is already taken" }]
      );
    }
  }

  const updateFields = {};
  if (firstName) updateFields.firstName = firstName;
  if (lastName) updateFields.lastName = lastName;
  if (username) updateFields.username = username;
  if (email) updateFields.email = email;
  if (phoneNumber) updateFields.phoneNumber = phoneNumber;
  if (status) updateFields.status = status;
  if (department) updateFields.department = department;
  if (typeof isDeleted === "boolean") updateFields.isDeleted = isDeleted;

  if (role) {
    if (!["user", "manager"].includes(role)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid user role specified."
      );
    }
    updateFields.role = role;
  }

  if (password) {
    updateFields.password = await hashPassword(password);
  }

  const updatedUser = await userModel
    .findByIdAndUpdate(id, { $set: updateFields }, { new: true })
    .select("-password");

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { user: updatedUser },
    "User details updated successfully."
  );
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userModel.findById(id).select("-password");
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  }
  return new ApiResponse(
    res,
    httpStatus.OK,
    { user },
    "User retrieved successfully."
  );
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userModel.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  }
  return new ApiResponse(
    res,
    httpStatus.OK,
    null,
    "User deleted successfully."
  );
});

export { createUser, getUsers, updateUser, getUserById, deleteUser };
