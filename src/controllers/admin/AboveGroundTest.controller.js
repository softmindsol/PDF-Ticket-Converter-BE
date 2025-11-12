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
  const baseQuery = AboveGroundTest.find(finalQueryFilters).populate(
    "createdBy",
    "username firstName lastName"
  );

  // CRITICAL: .filter() is no longer called here.
  const features = new ApiFeatures(baseQuery, req.query).sort().limitFields();

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

  // --- START: ADD THIS LOGIC ---
  const updateData = {};
  // Loop over the request body and add only the fields that have a value
  Object.keys(req.body).forEach((key) => {
    // This check handles both `null` and `undefined`
    if (req.body[key] != null) {
      updateData[key] = req.body[key];
    }
  });
  // --- END: ADD THIS LOGIC ---

  const updatedAboveGroundTest = await AboveGroundTest.findByIdAndUpdate(
    id,
    { $set: updateData }, // <-- Use the filtered 'updateData' object here
    { new: true, runValidators: true }
  );

  if (!updatedAboveGroundTest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Above Ground Test not found.");
  }

  // The rest of your PDF generation logic remains the same...
  try {
    const html = await generateAbovegroundTestHtml(updatedAboveGroundTest);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${updatedAboveGroundTest?._id}-${safeTimestamp}.pdf`;
    const fileName = await savePdfToFile(html, newFileName, "above-ground");

    updatedAboveGroundTest.ticket = fileName?.url;

    const finalUpdatedTest = await updatedAboveGroundTest.save();

    return new ApiResponse(
      res,
      httpStatus.OK,
      { aboveGroundTest: finalUpdatedTest },
      "Above Ground Test details updated successfully."
    );
  } catch (pdfError) {
    console.error("Failed to regenerate PDF for above ground test:", pdfError);
    // You should also add error handling for the PDF generation, like in your other function
    return new ApiResponse(
      res,
      httpStatus.OK,
      {
        aboveGroundTest: updatedAboveGroundTest,
        warning:
          "Above Ground Test was updated, but failed to regenerate the PDF.",
      },
      "Above Ground Test updated without a new PDF."
    );
  }
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
