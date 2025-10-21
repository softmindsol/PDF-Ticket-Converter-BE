import ServiceTicket from "#models/serviceTicket.model.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";
import { generateServiceTicketHtml } from "#root/src/services/service-ticket.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";

const createServiceTicket = asyncHandler(async (req, res) => {
  const {
    jobName,
    customerName,
    emailAddress,
    phoneNumber,
    jobLocation,
    workDescription,
    materials,
    technicianName,
    technicianContactNumber,
    stHours,
    otHours,
    applySalesTax,
    workOrderStatus,
    completionDate,
    customerSignature,
  } = req.body;

  const newServiceTicket = await ServiceTicket.create({
    jobName,
    customerName,
    emailAddress,
    phoneNumber,
    jobLocation,
    workDescription,
    materials,
    technicianName,
    technicianContactNumber,
    stHours,
    otHours,
    applySalesTax,
    workOrderStatus,
    completionDate,
    customerSignature,
    createdBy: req.user._id,
  });
  console.log("🚀 ~ newServiceTicket:", newServiceTicket)
    const html = await generateServiceTicketHtml(newServiceTicket);
  const safeTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const newFileName = `${newServiceTicket?._id}-${safeTimestamp}.pdf`;
  const fileName = await savePdfToFile(html, newFileName, 'service-ticket');  console.log("🚀 ~ fileName:", fileName);

  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { serviceTicket: newServiceTicket },
    "Service Ticket created successfully."
  );
});

const getServiceTickets = asyncHandler(async (req, res) => {
  const searchableFields = [
    "jobName",
    "customerName",
    "emailAddress",
    "technicianName",
    "jobLocation",
  ];

  const features = new ApiFeatures(
    ServiceTicket.find().populate("createdBy", "username"),
    req.query
  )
    .filter(searchableFields)
    .sort()
    .limitFields();

  const { documents: serviceTickets, pagination } = await features.execute();

  return new ApiResponse(
    res,
    httpStatus.OK,
    { serviceTickets, pagination },
    "Service Tickets retrieved successfully."
  );
});

const getServiceTicketById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const serviceTicket = await ServiceTicket.findById(id).populate(
    "createdBy",
    "username"
  );

  if (!serviceTicket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service Ticket not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { serviceTicket },
    "Service Ticket retrieved successfully."
  );
});

const updateServiceTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedServiceTicket = await ServiceTicket.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedServiceTicket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service Ticket not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { serviceTicket: updatedServiceTicket },
    "Service Ticket updated successfully."
  );
});

const deleteServiceTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const serviceTicket = await ServiceTicket.findByIdAndDelete(id);

  if (!serviceTicket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service Ticket not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    null,
    "Service Ticket deleted successfully."
  );
});

export {
  createServiceTicket,
  getServiceTickets,
  getServiceTicketById,
  updateServiceTicket,
  deleteServiceTicket,
};
