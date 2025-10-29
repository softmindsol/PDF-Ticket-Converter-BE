import httpStatus from "http-status";
import { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import UndergroundTicket from "#models/underGroundTest.model.js";
import User from "#models/user.model.js";
import { generateUndergroundTestHtml } from "#root/src/services/underGround.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";
import { sendEmailWithS3Attachment } from "#root/src/services/sendgrid.service.js";
import { uploadBase64ToS3 } from "#root/src/utils/base64.util.js";

const underGroundTicket = asyncHandler(async (req, res) => {
  if (req.body?.signatures?.forPropertyOwner?.signed) {
    req.body.signatures.forPropertyOwner.signed = await uploadBase64ToS3(
      req.body.signatures.forPropertyOwner.signed,
      "signature"
    );
  }
  if (req.body?.signatures?.forInstallingContractor?.signed) {
    req.body.signatures.forInstallingContractor.signed = await uploadBase64ToS3(
      req.body.signatures.forInstallingContractor.signed,
      "signature"
    );
  }
  const newUndergroundTicket = await UndergroundTicket.create({
    ...req.body,
    createdBy: req.user._id,
  });

  try {
    const html = await generateUndergroundTestHtml(newUndergroundTicket);

    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newUndergroundTicket._id}-${safeTimestamp}.pdf`;

    const pdfData = await savePdfToFile(
      html,
      newFileName,
      "underground-tickets"
    );

    newUndergroundTicket.ticket = pdfData?.url;

    const updatedTicket = await newUndergroundTicket.save();

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
          const subject = `New Underground Ticket Created: #${
            updatedTicket.ticketNumber || updatedTicket._id
          }`;
          const htmlContent = `
            <p>Hello,</p>
            <p>A new Underground Ticket has been created by <strong>${req.user.firstName} ${req.user.lastName}</strong>.</p>
            <p>The ticket PDF is attached for your review.</p>
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
          "Failed to send manager notification email for new underground ticket, but the ticket was created successfully.",
          emailError
        );
      }
    }

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      { ticket: updatedTicket },
      "Underground Ticket and PDF created successfully."
    );
  } catch (pdfError) {
    console.error("Failed to generate PDF for Underground Ticket:", pdfError);

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
