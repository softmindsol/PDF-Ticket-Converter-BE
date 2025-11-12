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
  // --- 1. Department & Security Filtering ---
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
      // Non-admin users with no department see nothing
      serverSideFilters.createdBy = null;
    }
  }

  // This will be our master filter object
  const finalQueryFilters = { ...serverSideFilters };

  // --- 2. Advanced Search Term Filtering ---
  if (req.query.search) {
    const searchTerm = req.query.search.trim();
    const searchRegex = new RegExp(searchTerm, "i");
    const userSearchOrConditions = [
      { username: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex },
    ];
    const nameParts = searchTerm.split(" ").filter(Boolean);
    if (nameParts.length > 1) {
      const part1Regex = new RegExp(nameParts[0], "i");
      const part2Regex = new RegExp(nameParts[1], "i");
      userSearchOrConditions.push({ $and: [{ firstName: part1Regex }, { lastName: part2Regex }] });
      userSearchOrConditions.push({ $and: [{ firstName: part2Regex }, { lastName: part1Regex }] });
    }
    const matchingUsers = await userModel.find({ $or: userSearchOrConditions }).select("_id");
    const matchingUserIds = matchingUsers.map((user) => user._id);
    const mainSearchOrConditions = [
      { "propertyDetails.propertyName": searchRegex },
      { "propertyDetails.propertyAddress": searchRegex },
    ];
    if (matchingUserIds.length > 0) {
      mainSearchOrConditions.push({ createdBy: { $in: matchingUserIds } });
    }
    finalQueryFilters.$or = mainSearchOrConditions;
  }

  // --- 3. Date Range and Other Direct Filtering ---
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields", "search", "department"];
  excludedFields.forEach((el) => delete queryObj[el]);

  Object.keys(queryObj).forEach((key) => {
    const match = key.match(/(.+)\[(gte|gt|lte|lt)\]/);

    if (match) {
      const field = match[1]; // e.g., 'propertyDetails.date' or 'createdAt'
      let operator = match[2];
      let value = queryObj[key];

      // ** FIX for the "Midnight Problem" **
      if (operator === "lte") {
        operator = "lt"; // Change to "less than"
        const endDate = new Date(value);
        endDate.setDate(endDate.getDate() + 1); // Increment to the next day
        value = endDate.toISOString().split('T')[0]; // Format back to 'YYYY-MM-DD'
      }

      if (!finalQueryFilters[field]) {
        finalQueryFilters[field] = {};
      }
      finalQueryFilters[field][`$${operator}`] = value;
    } else {
      // Handle other direct filters
      finalQueryFilters[key] = queryObj[key];
    }
  });

  // --- 4. Database Query Execution ---
  // The single .find() call now contains ALL combined filters
  const baseQuery = UnderGroundTest.find(finalQueryFilters).populate(
    "createdBy",
    "username firstName lastName"
  );

  // CRITICAL: .filter() is no longer called here.
  const features = new ApiFeatures(baseQuery, req.query).sort().limitFields();

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

  // --- START: ADD THIS LOGIC ---
  const updateData = {};
  // Loop over the request body and add only the fields that have a value
  Object.keys(req.body).forEach((key) => {
    // The check `!= null` conveniently handles both `null` and `undefined`
    if (req.body[key] != null) {
      updateData[key] = req.body[key];
    }
  });
  // --- END: ADD THIS LOGIC ---

  const updatedUndergroundTest = await UnderGroundTest.findByIdAndUpdate(
    id,
    { $set: updateData }, // <-- Use the new 'updateData' object here
    { new: true, runValidators: true }
  );

  if (!updatedUndergroundTest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Underground Test not found.");
  }

  try {
    const html = await generateUndergroundTestHtml(updatedUndergroundTest);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${updatedUndergroundTest._id}-${safeTimestamp}.pdf`;

    const pdfData = await savePdfToFile(html, newFileName, "under-ground");
    console.log("🚀 ~ PDF Data on update:", pdfData);

    updatedUndergroundTest.ticket = pdfData?.url;

    const finalUpdatedTest = await updatedUndergroundTest.save();

    return new ApiResponse(
      res,
      httpStatus.OK,
      { undergroundTest: finalUpdatedTest },
      "Underground Test and PDF updated successfully."
    );
  } catch (pdfError) {
    console.error("Failed to regenerate PDF for underground test:", pdfError);

    return new ApiResponse(
      res,
      httpStatus.OK,
      {
        undergroundTest: updatedUndergroundTest,
        warning:
          "Underground Test was updated, but failed to regenerate the PDF.",
      },
      "Underground Test updated without a new PDF."
    );
  }
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
