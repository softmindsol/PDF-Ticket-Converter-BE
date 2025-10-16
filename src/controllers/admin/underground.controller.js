import UnderGroundTest from "#models/underGroundTest.model.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";

const createUndergroundTest = asyncHandler(async (req, res) => {
  const newUndergroundTest = await UnderGroundTest.create({
    ...req.body,
    createdBy: req.user._id,
  });

  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { undergroundTest: newUndergroundTest },
    "Underground Test created successfully."
  );
});

const getUndergroundTests = asyncHandler(async (req, res) => {
  // Define searchable fields from your UnderGroundTest schema
  const searchableFields = ["propertyDetails.propertyName", "propertyDetails.propertyAddress"];

  const features = new ApiFeatures(
    UnderGroundTest.find().populate("createdBy", "username"),
    req.query
  )
    .filter(searchableFields)
    .sort()
    .limitFields();

  const { documents: undergroundTests, pagination } = await features.execute();

  return new ApiResponse(
    res,
    httpStatus.OK,
    { undergroundTests, pagination },
    "Underground Tests retrieved successfully."
  );
});

const getUndergroundTestById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const undergroundTest = await UnderGroundTest.findById(id).populate("createdBy", "username");

  if (!undergroundTest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Underground Test not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { undergroundTest },
    "Underground Test retrieved successfully."
  );
});

const updateUndergroundTest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedUndergroundTest = await UnderGroundTest.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!updatedUndergroundTest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Underground Test not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { undergroundTest: updatedUndergroundTest },
    "Underground Test details updated successfully."
  );
});

const deleteUndergroundTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const undergroundTest = await UnderGroundTest.findByIdAndDelete(id);

  if (!undergroundTest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Underground Test not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    null,
    "Underground Test deleted successfully."
  );
});

export {
  createUndergroundTest,
  getUndergroundTests,
  getUndergroundTestById,
  updateUndergroundTest,
  deleteUndergroundTest,
};