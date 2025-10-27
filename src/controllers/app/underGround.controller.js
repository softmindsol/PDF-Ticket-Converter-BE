import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import underGroundTest from "#models/underGroundTest.model.js";
import { generateUndergroundTestHtml } from "#root/src/services/underGround.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";

const underGroundTicket = asyncHandler(async (req, res) => {
  // Create the new underground ticket using the request body and user ID
  const newUndergroundTicket = await UndergroundTicket.create({
    ...req.body,
    createdBy: req.user._id,
  });

  try {
    // Generate the HTML content needed for the PDF document
    const html = await generateUndergroundTestHtml(newUndergroundTicket);

    // Create a safe, unique filename using the ticket's ID and a timestamp
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newUndergroundTicket._id}-${safeTimestamp}.pdf`;

    // Call the helper function to save the HTML as a PDF
    const pdfData = await savePdfToFile(html, newFileName, "underground-tickets");
    console.log("🚀 ~ PDF Data:", pdfData);

    // Attach the URL of the newly created PDF to the ticket record
    newUndergroundTicket.ticket = pdfData?.url;

    // Save the updated record to the database
    const updatedTicket = await newUndergroundTicket.save();

    // Return a success response with the updated ticket data
    return new ApiResponse(
      res,
      httpStatus.CREATED,
      { ticket: updatedTicket },
      "Underground Ticket and PDF created successfully."
    );
  } catch (pdfError) {
    // If PDF generation fails, log the error for diagnostics
    console.error("Failed to generate PDF for Underground Ticket:", pdfError);

    // Return a success response for the ticket creation, but add a warning
    return new ApiResponse(
      res,
      httpStatus.CREATED,
      {
        ticket: newUndergroundTicket,
        warning:
          "Underground Ticket was created, but failed to generate the PDF.",
      },
      "Underground Ticket created without a PDF."
    );
  }
});

export { underGroundTicket };