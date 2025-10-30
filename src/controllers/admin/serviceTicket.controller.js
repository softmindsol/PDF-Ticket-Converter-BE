import ServiceTicket from "#models/serviceTicket.model.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";
import { generateServiceTicketHtml } from "#root/src/services/service-ticket.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";
import userModel from "#root/src/models/user.model.js";

const createServiceTicket = asyncHandler(async (req, res) => {
  const newServiceTicket = await ServiceTicket.create({
    ...req.body,
    createdBy: req.user._id,
  });

  try {
    const html = await generateServiceTicketHtml(newServiceTicket);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newServiceTicket._id}-${safeTimestamp}.pdf`;

    const pdfData = await savePdfToFile(html, newFileName, "service-tickets");
    console.log("🚀 ~ PDF Data:", pdfData);

    newServiceTicket.ticket = pdfData?.url;

    const updatedServiceTicket = await newServiceTicket.save();

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      { serviceTicket: updatedServiceTicket },
      "Service Ticket and PDF created successfully."
    );
  } catch (pdfError) {
    console.error("Failed to generate PDF for service ticket:", pdfError);

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      {
        serviceTicket: newServiceTicket,
        warning:
          "Service Ticket was created, but failed to generate PDF profile.",
      },
      "Service Ticket created without a PDF."
    );
  }
});

const getServiceTickets = asyncHandler(async (req, res) => {
  const searchableFields = [
    "jobName",
    "customerName",
    "emailAddress",
    "technicianName",
    "jobLocation",
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

  const baseQuery = ServiceTicket.find(serverSideFilters).populate(
    "createdBy",
    "username"
  );

  const features = new ApiFeatures(baseQuery, req.query)
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

  // Step 1: Update the service ticket with the new data from the request body
  const updatedServiceTicket = await ServiceTicket.findByIdAndUpdate(
    id,
    { $set: req.body }, // Using $set is often safer
    {
      new: true, // Return the updated document
      runValidators: true,
    }
  );

  // Step 2: If no ticket was found, throw a 404 error
  if (!updatedServiceTicket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service Ticket not found.");
  }

  // Step 3: Try to regenerate the PDF with the updated data
  try {
    const html = await generateServiceTicketHtml(updatedServiceTicket);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${updatedServiceTicket._id}-${safeTimestamp}.pdf`;

    const pdfData = await savePdfToFile(html, newFileName, "service-tickets");
    console.log("🚀 ~ PDF Data on update:", pdfData);

    // Update the ticket field with the URL of the new PDF
    updatedServiceTicket.ticket = pdfData?.url;

    // Save the ticket again to persist the new PDF URL
    const finalServiceTicket = await updatedServiceTicket.save();

    return new ApiResponse(
      res,
      httpStatus.OK,
      { serviceTicket: finalServiceTicket },
      "Service Ticket updated and PDF regenerated successfully."
    );
  } catch (pdfError) {
    // Step 4: Handle cases where PDF generation fails
    console.error("Failed to regenerate PDF for service ticket:", pdfError);

    // The main data was updated successfully, but the PDF failed.
    // Return a success response but include a warning message.
    return new ApiResponse(
      res,
      httpStatus.OK, // The update itself was successful
      {
        serviceTicket: updatedServiceTicket, // Return the updated data (with the old PDF link)
        warning:
          "Service Ticket was updated, but failed to regenerate PDF profile.",
      },
      "Service Ticket updated without a new PDF."
    );
  }
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
