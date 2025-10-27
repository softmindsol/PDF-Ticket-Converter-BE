import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import AboveGround from "#models/aboveGroundTest.model.js";
import { generateAbovegroundTestHtml } from "#root/src/services/aboveGround.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";

const createAboveGroundTicket = asyncHandler(async (req, res) => {
  const newAboveGroundTicket = await AboveGround.create({
    ...req.body,
    createdBy: req.user._id,
  });

  try {
    const html = await generateAbovegroundTestHtml(newAboveGroundTicket);

    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newAboveGroundTicket._id}-${safeTimestamp}.pdf`;

    const pdfData = await savePdfToFile(
      html,
      newFileName,
      "above-ground-tickets"
    );
    console.log("🚀 ~ PDF Data:", pdfData);

    newAboveGroundTicket.ticket = pdfData?.url;

    const updatedTicket = await newAboveGroundTicket.save();

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      { ticket: updatedTicket },
      "Above Ground Ticket and PDF created successfully."
    );
  } catch (pdfError) {
    console.error("Failed to generate PDF for Above Ground Ticket:", pdfError);

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      {
        ticket: newAboveGroundTicket,
        warning:
          "Above Ground Ticket was created, but failed to generate the PDF.",
      },
      "Above Ground Ticket created without a PDF."
    );
  }
});

export { createAboveGroundTicket };
