import AboveGroundTest from "#models/aboveGroundTest.model.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";
import { generateAbovegroundTestHtml } from "#root/src/services/aboveGround.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";
import userModel from "#root/src/models/user.model.js";

const createAboveGroundTest = asyncHandler(async (req, res) => {
  const newAboveGroundTest = await AboveGroundTest.create({
    ...req.body,
    createdBy: req.user._id,
  });
  const html = await generateAbovegroundTestHtml(newAboveGroundTest);
  const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const newFileName = `${newAboveGroundTest?._id}-${safeTimestamp}.pdf`;
  const fileName = await savePdfToFile(html, newFileName, "above-ground");
  console.log("🚀 ~ fileName:", fileName);
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
  const searchableFields = [
    "propertyDetails.propertyName",
    "propertyDetails.propertyAddress",
  ];

  let serverSideFilters = {};

  if (req.user.role === "admin") {
    if (req.query.department) {
      const usersInDepartment = await userModel
        .find({ department: req.query.department })
        .select("_id");

      const userIds = usersInDepartment.map((user) => user._id);

      serverSideFilters.createdBy = { $in: userIds };
    }
  } else {
    if (req.user.department?._id) {
      const usersInDepartment = await userModel
        .find({ department: req.user.department._id })
        .select("_id");

      const userIds = usersInDepartment.map((user) => user._id);
      serverSideFilters.createdBy = { $in: userIds };
    } else {
      serverSideFilters.createdBy = null;
    }
  }

  const baseQuery = AboveGroundTest.find(serverSideFilters).populate(
    "createdBy",
    "username"
  );

  const features = new ApiFeatures(baseQuery, req.query)
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
  const aboveGroundTest = await AboveGroundTest.findById(id).populate(
    "createdBy",
    "username"
  );
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

  // First, update the document with the new data from the request
  const updatedAboveGroundTest = await AboveGroundTest.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  // If no document was found with that ID, throw an error
  if (!updatedAboveGroundTest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Above Ground Test not found.");
  }

  // Now, regenerate the PDF with the updated data
  const html = await generateAbovegroundTestHtml(updatedAboveGroundTest);
  const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const newFileName = `${updatedAboveGroundTest?._id}-${safeTimestamp}.pdf`;
  const fileName = await savePdfToFile(html, newFileName, "above-ground");

  // Update the ticket field with the new PDF's URL
  updatedAboveGroundTest.ticket = fileName?.url;
  
  // Save the document again to persist the new ticket URL
  const finalUpdatedTest = await updatedAboveGroundTest.save();

  // Return the fully updated document in the response
  return new ApiResponse(
    res,
    httpStatus.OK,
    { aboveGroundTest: finalUpdatedTest },
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
