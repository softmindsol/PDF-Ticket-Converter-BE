import UnderGroundTest from "#models/underGroundTest.model.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";
import { generateUndergroundTestHtml } from "#root/src/services/underGround.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";
import userModel from "#root/src/models/user.model.js";

const createUndergroundTest = asyncHandler(async (req, res) => {
  const newUndergroundTest = await UnderGroundTest.create({
    ...req.body,
    createdBy: req.user._id,
  });

  try {
    const html = await generateUndergroundTestHtml(newUndergroundTest);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newUndergroundTest._id}-${safeTimestamp}.pdf`;

    const pdfData = await savePdfToFile(html, newFileName, "under-ground");
    console.log("🚀 ~ PDF Data:", pdfData);

    newUndergroundTest.ticket = pdfData?.url;

    const updatedUndergroundTest = await newUndergroundTest.save();

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      { undergroundTest: updatedUndergroundTest },
      "Underground Test and PDF created successfully."
    );
  } catch (pdfError) {
    console.error("Failed to generate PDF for underground test:", pdfError);

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      {
        undergroundTest: newUndergroundTest,
        warning:
          "Underground Test was created, but failed to generate the PDF.",
      },
      "Underground Test created without a PDF."
    );
  }
});

const getUndergroundTests = asyncHandler(async (req, res) => {
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

  const baseQuery = UnderGroundTest.find(serverSideFilters).populate(
    "createdBy",
    "username"
  );

  const features = new ApiFeatures(baseQuery, req.query)
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
  const undergroundTest = await UnderGroundTest.findById(id).populate(
    "createdBy",
    "username"
  );

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
