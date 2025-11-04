import WorkOrder from "#models/workOrder.model.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";
import { generateWorkOrderHtml } from "#root/src/services/work-order.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";
import userModel from "#root/src/models/user.model.js";

const createWorkOrder = asyncHandler(async (req, res) => {
  const {
    customerName,
    emailAddress,
    phoneNumber,
    jobNumber,
    technicianName,
    contactNumber,
    paymentMethod,
    materialList,
    date,
    customerSignature,
  } = req.body;

  const existingWorkOrder = await WorkOrder.findOne({ jobNumber });
  if (existingWorkOrder) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A work order with this job number already exists.",
      [{ jobNumber: "Job number is already taken" }]
    );
  }

  const newWorkOrder = await WorkOrder.create({
    customerName,
    emailAddress,
    phoneNumber,
    jobNumber,
    technicianName,
    contactNumber,
    paymentMethod,
    materialList,
    date,
    customerSignature,
    createdBy: req.user._id,
  });

  try {
    const html = await generateWorkOrderHtml(newWorkOrder);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newWorkOrder._id}-${safeTimestamp}.pdf`;

    const pdfData = await savePdfToFile(html, newFileName, "work-order");
    console.log("🚀 ~ PDF Data:", pdfData);

    newWorkOrder.ticket = pdfData?.url;

    const updatedWorkOrder = await newWorkOrder.save();

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      { workOrder: updatedWorkOrder },
      "Work Order and PDF created successfully."
    );
  } catch (pdfError) {
    console.error("Failed to generate PDF for work order:", pdfError);

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      {
        workOrder: newWorkOrder,
        warning:
          "Work Order was created, but failed to generate the PDF ticket.",
      },
      "Work Order created without a PDF."
    );
  }
});

const getWorkOrders = asyncHandler(async (req, res) => {
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
      { customerName: searchRegex },
      { emailAddress: searchRegex },
      { jobNumber: searchRegex },
      { technicianName: searchRegex },
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
      const field = match[1]; // e.g., 'createdAt' or 'date'
      let operator = match[2];
      let value = queryObj[key];

      // ** FIX for the "Midnight Problem" **
      // If filtering for "less than or equal to" a date, we actually
      // search for "less than" the *start of the next day*.
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
      // Handle other direct filters like ?paymentMethod=cash
      finalQueryFilters[key] = queryObj[key];
    }
  });

  // --- 4. Database Query Execution ---
  // The single .find() call now contains ALL combined filters
  const baseQuery = WorkOrder.find(finalQueryFilters).populate(
    "createdBy",
    "username firstName lastName"
  );

  // CRITICAL: .filter() is no longer called here.
  // ApiFeatures is now only responsible for sorting, pagination, and fields.
  const features = new ApiFeatures(baseQuery, req.query).sort().limitFields();

  const { documents: workOrders, pagination } = await features.execute();

  return new ApiResponse(
    res,
    httpStatus.OK,
    { workOrders, pagination },
    "Work Orders retrieved successfully."
  );
});

const getWorkOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const workOrder = await WorkOrder.findById(id).populate(
    "createdBy",
    "username"
  );
  if (!workOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Work Order not found.");
  }
  return new ApiResponse(
    res,
    httpStatus.OK,
    { workOrder },
    "Work Order retrieved successfully."
  );
});

const updateWorkOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { jobNumber } = req.body;

  if (jobNumber) {
    const existingWorkOrder = await WorkOrder.findOne({ jobNumber });
    if (existingWorkOrder && existingWorkOrder._id.toString() !== id) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "This job number is already in use by another work order.",
        [{ jobNumber: "Job number is already taken" }]
      );
    }
  }

  const updatedWorkOrder = await WorkOrder.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!updatedWorkOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Work Order not found.");
  }

  try {
    const html = await generateWorkOrderHtml(updatedWorkOrder);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${updatedWorkOrder._id}-${safeTimestamp}.pdf`;

    const pdfData = await savePdfToFile(html, newFileName, "work-order");
    console.log("🚀 ~ PDF Data on update:", pdfData);

    updatedWorkOrder.ticket = pdfData?.url;

    const finalWorkOrder = await updatedWorkOrder.save();

    return new ApiResponse(
      res,
      httpStatus.OK,
      { workOrder: finalWorkOrder },
      "Work Order and PDF updated successfully."
    );
  } catch (pdfError) {
    console.error("Failed to regenerate PDF for work order:", pdfError);

    return new ApiResponse(
      res,
      httpStatus.OK,
      {
        workOrder: updatedWorkOrder,
        warning:
          "Work Order was updated, but failed to regenerate the PDF ticket.",
      },
      "Work Order updated without a new PDF."
    );
  }
});

const deleteWorkOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const workOrder = await WorkOrder.findByIdAndDelete(id);
  if (!workOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Work Order not found.");
  }
  return new ApiResponse(
    res,
    httpStatus.OK,
    null,
    "Work Order deleted successfully."
  );
});

const regenerateWorkOrderPdf = asyncHandler(async (req, res) => {
  const { id } = req.params;

  
  const workOrder = await WorkOrder.findById(id);

  if (!workOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Work Order not found.");
  }

  try {
    
    const html = await generateWorkOrderHtml(workOrder);

    
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${workOrder._id}-${safeTimestamp}.pdf`;

    
    const pdfData = await savePdfToFile(html, newFileName, "work-order");

    
    workOrder.ticket = pdfData?.url;

    
    const updatedWorkOrder = await workOrder.save();

    
    return new ApiResponse(
      res,
      httpStatus.OK,
      { workOrder: updatedWorkOrder },
      "Work Order PDF regenerated and updated successfully."
    );
  } catch (pdfError) {
    console.error("Failed to regenerate PDF for work order:", pdfError);

    
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to regenerate the PDF ticket. Please try again."
    );
  }
});

export {
  createWorkOrder,
  getWorkOrders,
  getWorkOrderById,
  updateWorkOrder,
  deleteWorkOrder,
  regenerateWorkOrderPdf
};
