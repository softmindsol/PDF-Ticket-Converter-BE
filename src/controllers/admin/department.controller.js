import departmentModel from '#models/department.model.js';
import httpStatus from 'http-status';
import ApiError, { ApiResponse, asyncHandler } from '#utils/api.utils.js';
import ApiFeatures from '#root/src/utils/apiFeatures.util.js';
import { forms } from '#root/src/consts/forms.js';
import userModel from '#root/src/models/user.model.js';
import mongoose from 'mongoose';

const getDepartments = asyncHandler(async (req, res) => {
  const searchableFields = ['name'];

  const features = new ApiFeatures(
    departmentModel.find().populate('manager', 'firstName lastName'),
    req.query,
  )
    .filter(searchableFields)
    .sort()
    .limitFields();

  const { documents: departments, pagination } = await features.execute();

  return new ApiResponse(
    res,
    httpStatus.OK,
    { departments, pagination },
    'Departments retrieved successfully.',
  );
});
const createDepartment = asyncHandler(async (req, res) => {
  const { name, manager: managerIds } = req.body;

  const existingDepartment = await departmentModel.findOne({ name });
  if (existingDepartment) {
    throw new ApiError(httpStatus.CONFLICT, 'Department with this name already exists.', [
      { name: 'Department name is already taken' },
    ]);
  }

  let newDepartment;

  const session = await mongoose.startSession();
  try {
    try {
      await session.withTransaction(async () => {
        newDepartment = await departmentModel.create([req.body], { session });
        newDepartment = newDepartment[0];

        if (managerIds && managerIds.length > 0) {
          await userModel.updateMany(
            { _id: { $in: managerIds } },
            { $set: { role: 'manager' } },
            { session },
          );
        }
      });
    } catch (txError) {
      if (txError && txError.code === 20) {
        newDepartment = await departmentModel.create(req.body);
        if (managerIds && managerIds.length > 0) {
          await userModel.updateMany(
            { _id: { $in: managerIds } },
            { $set: { role: 'manager' } },
          );
        }
      } else {
        throw txError;
      }
    }
  } finally {
    await session.endSession();
  }

  const populatedDepartment = await departmentModel
    .findById(newDepartment._id)
    .populate('manager', 'firstName lastName username');

  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { department: populatedDepartment },
    'Department created successfully.',
  );
});

const getForms = asyncHandler(async (req, res) => {
  return new ApiResponse(res, httpStatus.OK, forms, 'Forms retrieved successfully.');
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const department = await departmentModel
    .findById(id)
    .populate('manager', 'firstName lastName username');

  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Department not found.');
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { department },
    'Department retrieved successfully.',
  );
});

const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, manager: newManagerIds, ...otherFields } = req.body;

  const currentDepartment = await departmentModel.findById(id);

  if (!currentDepartment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Department not found.');
  }

  if (name && name !== currentDepartment.name) {
    const existingDepartment = await departmentModel.findOne({ name });
    if (existingDepartment && existingDepartment._id.toString() !== id) {
      throw new ApiError(httpStatus.CONFLICT, 'This department name is already in use.', [
        { name: 'Department name is already taken' },
      ]);
    }
  }

  const oldManagerIds = currentDepartment.manager.map(m => m.toString());

  const newManagerIdsArray = Array.isArray(newManagerIds)
    ? newManagerIds
    : newManagerIds
      ? [newManagerIds]
      : [];

  const managersToAdd = newManagerIdsArray.filter(id => !oldManagerIds.includes(id));
  const managersToRemove = oldManagerIds.filter(id => !newManagerIdsArray.includes(id));

  if (managersToAdd.length === 0 && managersToRemove.length === 0) {
    const updatedDept = await departmentModel
      .findByIdAndUpdate(id, { $set: req.body }, { new: true })
      .populate('manager', 'firstName lastName username');
    return new ApiResponse(
      res,
      httpStatus.OK,
      { department: updatedDept },
      'Department details updated successfully.',
    );
  }

  const session2 = await mongoose.startSession();
  let updatedDepartment;

  try {
    try {
      await session2.withTransaction(async () => {
        if (managersToRemove.length > 0) {
          await userModel.updateMany(
            { _id: { $in: managersToRemove } },
            { $set: { role: 'user' } },
            { session: session2 },
          );
        }

        if (managersToAdd.length > 0) {
          await userModel.updateMany(
            { _id: { $in: managersToAdd } },
            { $set: { role: 'manager' } },
            { session: session2 },
          );
        }

        updatedDepartment = await departmentModel
          .findByIdAndUpdate(
            id,
            { $set: { ...otherFields, name, manager: newManagerIdsArray } },
            { new: true, session: session2 },
          )
          .populate('manager', 'firstName lastName username');

        if (!updatedDepartment) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Department not found during update.');
        }
      });
    } catch (txError) {
      if (txError && txError.code === 20) {
        // fallback to non-transactional updates
        if (managersToRemove.length > 0) {
          await userModel.updateMany(
            { _id: { $in: managersToRemove } },
            { $set: { role: 'user' } },
          );
        }

        if (managersToAdd.length > 0) {
          await userModel.updateMany(
            { _id: { $in: managersToAdd } },
            { $set: { role: 'manager' } },
          );
        }

        updatedDepartment = await departmentModel
          .findByIdAndUpdate(
            id,
            { $set: { ...otherFields, name, manager: newManagerIdsArray } },
            { new: true },
          )
          .populate('manager', 'firstName lastName username');

        if (!updatedDepartment) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Department not found during update.');
        }
      } else {
        throw txError;
      }
    }
  } finally {
    await session2.endSession();
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { department: updatedDepartment },
    'Department details and manager roles updated successfully.',
  );
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const department = await departmentModel.findByIdAndDelete(id);

  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Department not found.');
  }

  return new ApiResponse(res, httpStatus.OK, null, 'Department deleted successfully.');
});

export {
  getDepartments,
  createDepartment,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getForms,
};
