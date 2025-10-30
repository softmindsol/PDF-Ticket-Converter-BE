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
  const searchableFields = [
    "customerName",
    "emailAddress",
    "jobNumber",
    "technicianName",
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

  const baseQuery = WorkOrder.find(serverSideFilters).populate(
    "createdBy",
    "username"
  );

  const features = new ApiFeatures(baseQuery, req.query)
    .filter(searchableFields)
    .sort()
    .limitFields();

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
  const {
    // You can still destructure here for clarity if you want
    jobNumber,
  } = req.body;

  // 1. Check for duplicate job number
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

  // 2. Find and update the document with all data from req.body
  const updatedWorkOrder = await WorkOrder.findByIdAndUpdate(
    id,
    { $set: req.body }, // $set is safer and updates only provided fields
    { new: true, runValidators: true }
  );

  // 3. If no work order was found, throw an error
  if (!updatedWorkOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Work Order not found.");
  }

  // 4. Attempt to regenerate and replace the PDF
  try {
    // Generate HTML with the new, updated data
    const html = await generateWorkOrderHtml(updatedWorkOrder);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${updatedWorkOrder._id}-${safeTimestamp}.pdf`;

    // Save the new PDF file
    const pdfData = await savePdfToFile(html, newFileName, "work-order");
    console.log("🚀 ~ PDF Data on update:", pdfData);

    // Update the ticket field with the new PDF's URL
    updatedWorkOrder.ticket = pdfData?.url;

    // Save the document a second time to persist the new ticket URL
    const finalWorkOrder = await updatedWorkOrder.save();

    // Return the final, fully updated work order
    return new ApiResponse(
      res,
      httpStatus.OK,
      { workOrder: finalWorkOrder },
      "Work Order and PDF updated successfully."
    );
  } catch (pdfError) {
    // 5. Handle PDF generation failure gracefully
    console.error("Failed to regenerate PDF for work order:", pdfError);

    // The data update succeeded, so return a 200 OK response
    // but include a warning that the PDF is now out-of-date.
    return new ApiResponse(
      res,
      httpStatus.OK,
      {
        workOrder: updatedWorkOrder, // Return the updated data with the old ticket URL
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

export {
  createWorkOrder,
  getWorkOrders,
  getWorkOrderById,
  updateWorkOrder,
  deleteWorkOrder,
};
