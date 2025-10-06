import WorkOrder from "#models/workOrder.model.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";

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

  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { workOrder: newWorkOrder },
    "Work Order created successfully."
  );
});

const getWorkOrders = asyncHandler(async (req, res) => {
  const searchableFields = ["customerName", "emailAddress", "jobNumber", "technicianName"];

  const features = new ApiFeatures(
    WorkOrder.find().populate("createdBy", "username"),
    req.query
  )
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
  const workOrder = await WorkOrder.findById(id).populate("createdBy", "username");
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

export { createWorkOrder, getWorkOrders, getWorkOrderById, updateWorkOrder, deleteWorkOrder };