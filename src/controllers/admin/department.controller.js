import { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import departmentModel from "#models/department.model.js";
import ApiError from "#utils/api.utils.js";
import httpStatus from "http-status";

const createDepartment = asyncHandler(async (req, res, next) => {
    const { name} = req.body;
  
  
    const existingDepartment = await departmentModel.findOne({ name });
    if (existingDepartment) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "A department with this name already exists",
        [{ name: "Department name must be unique" }]
      );
    }
  
    const departmentData = { name };
  
    const newDepartment = await departmentModel.create(departmentData);
    console.log("🚀 ~ newDepartment:", newDepartment)
  
    return new ApiResponse(
        res,
        httpStatus.CREATED,
        { _id: newDepartment._id },
        "Department created successfully"
      );
  });

  export {createDepartment}