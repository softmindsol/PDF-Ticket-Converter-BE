import userModel from "#models/user.model.js";
import { hashPassword } from "#utils/auth.utils.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";

const createManager = asyncHandler(async (req, res) => {
  const { username, password, firstName, lastName } = req.body;

  const existingUser = await userModel.findOne({ username });
  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A user with this username already exists",
      [{ username: "Username is already taken" }]
    );
  }



  const hashedPassword = await hashPassword(password);

  const newManager = await userModel.create({
    username,
    password: hashedPassword,
    firstName,
    lastName,
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