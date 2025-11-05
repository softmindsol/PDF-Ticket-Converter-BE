import httpStatus from "http-status";
import { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import UnderGround from "#models/underGroundTest.model.js";
import User from "#models/user.model.js";
import { generateUndergroundTestHtml } from "#root/src/services/underGround.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";
import { sendEmailWithS3Attachment } from "#root/src/services/sendgrid.service.js";
import { uploadBase64ToS3 } from "#root/src/utils/base64.util.js";
import { CLIENT_URL } from "#root/src/config/env.config.js";

const underGroundTicket = asyncHandler(async (req, res) => {
  // Handle signature uploads if they exist
  if (req.body?.signatures?.forPropertyOwner?.signed) {
    req.body.signatures.forPropertyOwner.signed =
      await uploadBase64ToS3(
req.body?.signatures?.forPropertyOwner?.signed,
        "signature"
      );
  }
  if (req.body?.signatures?.forInstallingContractor?.signed) {
    req.body.signatures.forInstallingContractor.signed =
      await uploadBase64ToS3(
req.body?.signatures?.forInstallingContractor?.signed,
        "signature"
      );
  }

  const newUndergroundTicket = await UnderGround.create({
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
      "under-ground-tickets" // PDF save location
    );

    newUndergroundTicket.ticket = pdfData?.url;
    const updatedUndergroundTicket = await newUndergroundTicket.save();

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
          const subject = `New Under Ground Ticket Created: #${
            updatedUndergroundTicket.ticketNumber ||
            updatedUndergroundTicket._id
          }`;

          // Construct the direct link to the ticket
          const ticketUrl = `${CLIENT_URL}/under-ground/${updatedUndergroundTicket._id}`;

          const htmlContent = `
            <p>Hello,</p>
            <p>A new Under Ground Ticket has been created by <strong>${req.user.firstName} ${req.user.lastName}</strong>.</p>
            <p>You can view the ticket directly by clicking this link: <a href="${ticketUrl}">View Under Ground Ticket</a>.</p>
            <p>The ticket PDF is also attached for your review.</p>
            <p>Thank you.</p>
          `;

          await sendEmailWithS3Attachment(
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
      { undergroundTicket: updatedUndergroundTicket },
      "Under Ground Ticket and PDF created successfully."
    );
  } catch (pdfError) {
    console.error("Failed to generate PDF for Under Ground Ticket:", pdfError);

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      {
        undergroundTicket: newUndergroundTicket,
        warning:
          "Under Ground Ticket was created, but failed to generate the PDF.",
      },
      "Under Ground Ticket created without a PDF."
    );
  }
});

export { underGroundTicket };
