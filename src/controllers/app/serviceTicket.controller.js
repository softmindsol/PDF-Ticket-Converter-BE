import httpStatus from "http-status";
import { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ServiceTicket from "#models/serviceTicket.model.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";
import { generateServiceTicketHtml } from "#root/src/services/service-ticket.pdf.js";

const createServiceTicket = asyncHandler(async (req, res) => {
  // Create the new service ticket with the request body and user ID
  const newServiceTicket = await ServiceTicket.create({
    ...req.body,
    createdBy: req.user._id,
  });

  try {
    // Generate the HTML content for the PDF using the new ticket's data
    const html = await generateServiceTicketHtml(newServiceTicket);

    // Create a unique and safe timestamp for the PDF filename
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newServiceTicket._id}-${safeTimestamp}.pdf`;

    // Save the HTML as a PDF and get back data, including the URL
    const pdfData = await savePdfToFile(html, newFileName, "service-tickets");
    console.log("🚀 ~ PDF Data:", pdfData);

    // Assign the PDF's URL to the ticket property of the service ticket
    newServiceTicket.ticket = pdfData?.url;

    // Save the updated service ticket to the database
    const updatedServiceTicket = await newServiceTicket.save();

    // Return a success response with the updated service ticket
    return new ApiResponse(
      res,
      httpStatus.CREATED,
      { serviceTicket: updatedServiceTicket },
      "Service Ticket and PDF created successfully."
    );
  } catch (pdfError) {
    // Log the error for debugging purposes
    console.error("Failed to generate PDF for service ticket:", pdfError);

    // Return a success response for the ticket creation but include a warning about the PDF
    return new ApiResponse(
      res,
      httpStatus.CREATED,
      {
        serviceTicket: newServiceTicket,
        warning:
          "Service Ticket was created, but failed to generate the PDF.",
      },
      "Service Ticket created without a PDF."
    );
  }
});

export { createServiceTicket };
