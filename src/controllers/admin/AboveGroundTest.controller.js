import AboveGroundTest from "#models/aboveGroundTest.model.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";
import { generateAbovegroundTestHtml } from "#root/src/services/aboveGround.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";

const createAboveGroundTest = asyncHandler(async (req, res) => {
  const newAboveGroundTest = await AboveGroundTest.create({
    ...req.body,
    createdBy: req.user._id,
  });
    const html = await generateAbovegroundTestHtml(newAboveGroundTest);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newAboveGroundTest?._id}-${safeTimestamp}.pdf`;
    const fileName = await savePdfToFile(html, newFileName, "above-ground");
    console.log("🚀 ~ fileName:", fileName)
  newAboveGroundTest.ticket = fileName?.url;
  const updatedCustomerWithPdf = await newAboveGroundTest.save();
  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { aboveGroundTest: updatedCustomerWithPdf },
    "Above Ground Test created successfully."
  );
});

const getAboveGroundTests = asyncHandler(async (req, res) => {
  const searchableFields = ["propertyDetails.propertyName", "propertyDetails.propertyAddress"];

  const features = new ApiFeatures(
    AboveGroundTest.find().populate("createdBy", "username"),
    req.query
  )
    .filter(searchableFields)
    .sort()
    .limitFields();

  const { documents: aboveGroundTests, pagination } = await features.execute();

  return new ApiResponse(
    res,
    httpStatus.OK,
    { aboveGroundTests, pagination },
    "Above Ground Tests retrieved successfully."
  );
});

const getAboveGroundTestById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const aboveGroundTest = await AboveGroundTest.findById(id).populate("createdBy", "username");
  if (!aboveGroundTest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Above Ground Test not found.");
  }
  return new ApiResponse(
    res,
    httpStatus.OK,
    { aboveGroundTest },
    "Above Ground Test retrieved successfully."
  );
});

const updateAboveGroundTest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedAboveGroundTest = await AboveGroundTest.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!updatedAboveGroundTest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Above Ground Test not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { aboveGroundTest: updatedAboveGroundTest },
    "Above Ground Test details updated successfully."
  );
});

const deleteAboveGroundTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const aboveGroundTest = await AboveGroundTest.findByIdAndDelete(id);
  if (!aboveGroundTest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Above Ground Test not found.");
  }
  return new ApiResponse(
    res,
    httpStatus.OK,
    null,
    "Above Ground Test deleted successfully."
  );
});

export {
  createAboveGroundTest,
  getAboveGroundTests,
  getAboveGroundTestById,
  updateAboveGroundTest,
  deleteAboveGroundTest,
};