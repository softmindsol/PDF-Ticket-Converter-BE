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

  const updateFields = {};
  if (customerName) updateFields.customerName = customerName;
  if (emailAddress) updateFields.emailAddress = emailAddress;
  if (phoneNumber) updateFields.phoneNumber = phoneNumber;
  if (jobNumber) updateFields.jobNumber = jobNumber;
  if (technicianName) updateFields.technicianName = technicianName;
  if (contactNumber) updateFields.contactNumber = contactNumber;
  if (paymentMethod) updateFields.paymentMethod = paymentMethod;
  if (materialList) updateFields.materialList = materialList;
  if (date) updateFields.date = date;
  if (customerSignature) updateFields.customerSignature = customerSignature;

  const updatedWorkOrder = await WorkOrder.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true }
  );

  if (!updatedWorkOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Work Order not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { workOrder: updatedWorkOrder },
    "Work Order details updated successfully."
  );
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
