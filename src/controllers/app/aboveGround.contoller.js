import httpStatus from "http-status";
import { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import AboveGround from "#models/aboveGroundTest.model.js";
import User from "#models/user.model.js";
import { generateAbovegroundTestHtml } from "#root/src/services/aboveGround.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";
import { sendEmailWithS3Attachment } from "#root/src/services/sendgrid.service.js";

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

    newAboveGroundTicket.ticket = pdfData?.url;
    const updatedTicket = await newAboveGroundTicket.save();

    const managersExist = req.user?.department?.manager?.length >= 1;

    if (managersExist && pdfData?.url) {
      try {
        const managerIds = req.user.department.manager;

        const managers = await User.find({
          _id: { $in: managerIds },
        })
          .select("+email")
          .lean();

        const managerEmails = managers
          .map((manager) => manager.email)
          .filter(Boolean);

        if (managerEmails.length > 0) {
          const subject = `New Above Ground Ticket Created: #${
            updatedTicket.ticketNumber || updatedTicket._id
          }`;
          const htmlContent = `
            <p>Hello,</p>
            <p>A new Above Ground Ticket has been created by <strong>${req.user.firstName} ${req.user.lastName}</strong>.</p>
            <p>The ticket PDF is attached to this email for your review.</p>
            <p>Thank you.</p>
          `;

          sendEmailWithS3Attachment(
            managerEmails,
            subject,
            htmlContent,
            pdfData.url
          );
        }
      } catch (emailError) {
        console.error(
          "Failed to send manager notification email, but the ticket was created successfully.",
          emailError
        );
      }
    }

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
