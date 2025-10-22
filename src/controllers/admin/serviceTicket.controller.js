import ServiceTicket from "#models/serviceTicket.model.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";
import { generateServiceTicketHtml } from "#root/src/services/service-ticket.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";

const createServiceTicket = asyncHandler(async (req, res) => {
  // 1. Create the initial service ticket record in the database.
  const newServiceTicket = await ServiceTicket.create({
    ...req.body,
    createdBy: req.user._id,
  });

  // 2. Generate the HTML and upload the corresponding PDF to S3.
  //    (We wrap this in a try/catch to handle potential PDF generation errors gracefully)
  try {
    const html = await generateServiceTicketHtml(newServiceTicket);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newServiceTicket._id}-${safeTimestamp}.pdf`;
    
    // This function should return an object like { key: '...', url: '...' }
    const pdfData = await savePdfToFile(html, newFileName, 'service-tickets');
    console.log("🚀 ~ PDF Data:", pdfData);

    // 3. Update the document in memory with the S3 URL.
    //    We save the full URL as per your requirement.
    newServiceTicket.ticket = pdfData?.url;

    // 4. Save the updated document back to the database.
    const updatedServiceTicket = await newServiceTicket.save();

    // 5. Respond with the FINAL, fully updated service ticket object.
    return new ApiResponse(
      res,
      httpStatus.CREATED,
      { serviceTicket: updatedServiceTicket },
      "Service Ticket and PDF created successfully."
    );
  } catch (pdfError) {
    console.error("Failed to generate PDF for service ticket:", pdfError);
    // If PDF fails, we still return the created ticket but with a warning.
    return new ApiResponse(
      res,
      httpStatus.CREATED,
      {
        serviceTicket: newServiceTicket,
        warning: "Service Ticket was created, but failed to generate PDF profile."
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
