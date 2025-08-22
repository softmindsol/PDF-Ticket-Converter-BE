import departmentModel from "#models/department.model.js";
import userModel from "#models/user.model.js";
import { hashPassword } from "#utils/auth.utils.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";

const createManager = asyncHandler(async (req, res) => {
  const { username, password, firstName, lastName, department } = req.body;

  const existingUser = await userModel.findOne({ username });
  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A user with this username already exists",
      [{ username: "Username is already taken" }]
    );
  }

  const departmentExists = await departmentModel.findById(department);
  if (!departmentExists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "The specified department does not exist",
      [{ department: "Department not found" }]
    );
  }

  const hashedPassword = await hashPassword(password);

  const newManager = await userModel.create({
    username,
    password: hashedPassword,
    firstName,
    lastName,
    department,
    role: "manager", 
  });

  const managerResponse = newManager.toObject();
  delete managerResponse.password;

return  new ApiResponse(
    res,
    httpStatus.CREATED,
    { manager: managerResponse },
    "Manager created successfully"
  );
});

export { createManager };