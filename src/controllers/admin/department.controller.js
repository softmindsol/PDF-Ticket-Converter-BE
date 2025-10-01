import departmentModel from "#models/department.model.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";
import { forms } from "#root/src/consts/forms.js";
import userModel from "#root/src/models/user.model.js";
import mongoose from "mongoose";

const getDepartments = asyncHandler(async (req, res) => {
  const searchableFields = ["name"];

  const features = new ApiFeatures(departmentModel.find().populate("manager", "firstName lastName"), req.query)
    .filter(searchableFields)
    .sort()
    .limitFields();

  const { documents: departments, pagination } = await features.execute();

  return new ApiResponse(
    res,
    httpStatus.OK,
    { departments, pagination },
    "Departments retrieved successfully."
  );
});
const getForms = asyncHandler(async (req, res) => {
  return new ApiResponse(
    res,
    httpStatus.OK,
    forms,
    "Forms retrieved successfully."
  );
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const department = await departmentModel
    .findById(id)
    .populate("manager", "firstName lastName username");

  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { department },
    "Department retrieved successfully."
  );
});

const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, manager, status, isDeleted, doc, allowedForms } = req.body;

  const currentDepartment = await departmentModel.findById(id);

  if (!currentDepartment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found.");
  }

  if (name && name !== currentDepartment.name) {
    const existingDepartment = await departmentModel.findOne({ name });
    if (existingDepartment && existingDepartment._id.toString() !== id) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "This department name is already in use.",
        [{ name: "Department name is already taken" }]
      );
    }
  }

  const oldManagerId = currentDepartment.manager?.toString();
  const newManagerId = manager;

  if (oldManagerId === newManagerId) {
    const updatedDept = await departmentModel
      .findByIdAndUpdate(id, { $set: req.body }, { new: true })
      .populate("manager", "firstName lastName username");
    return new ApiResponse(
      res,
      httpStatus.OK,
      { department: updatedDept },
      "Department details updated successfully."
    );
  }

  const session = await mongoose.startSession();
  let updatedDepartment;

  try {
    await session.withTransaction(async () => {
      await Promise.all([
        oldManagerId
          ? userModel.findByIdAndUpdate(
              oldManagerId,
              { role: "user" },
              { session }
            )
          : Promise.resolve(),

        newManagerId
          ? userModel.findByIdAndUpdate(
              newManagerId,
              { role: "manager" },
              { session }
            )
          : Promise.resolve(),
      ]);

      const updateFields = { ...req.body };

      if ("manager" in req.body) {
        updateFields.manager = req.body.manager;
      }

      updatedDepartment = await departmentModel
        .findByIdAndUpdate(id, { $set: updateFields }, { new: true, session })
        .populate("manager", "firstName lastName username");

      if (!updatedDepartment) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Department not found during update."
        );
      }
    });
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { department: updatedDepartment },
    "Department details and manager roles updated successfully."
  );
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const department = await departmentModel.findByIdAndDelete(id);

  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    null,
    "Department deleted successfully."
  );
});

export {
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getForms,
};
