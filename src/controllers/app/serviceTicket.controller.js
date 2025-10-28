import httpStatus from "http-status";
import { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ServiceTicket from "#models/serviceTicket.model.js";
import User from "#models/user.model.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";
import { generateServiceTicketHtml } from "#root/src/services/service-ticket.pdf.js";
import { sendEmailWithS3Attachment } from "#root/src/services/sendgrid.service.js";

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

    newServiceTicket.ticket = pdfData?.url;

    const updatedServiceTicket = await newServiceTicket.save();

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
          const subject = `New Service Ticket Created: #${
            updatedServiceTicket.ticketNumber || updatedServiceTicket._id
          }`;
          const htmlContent = `
            <p>Hello,</p>
            <p>A new Service Ticket has been created by <strong>${req.user.firstName} ${req.user.lastName}</strong>.</p>
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
          "Failed to send manager notification email for new service ticket, but the ticket was created successfully.",
          emailError
        );
      }
    }

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
        warning: "Service Ticket was created, but failed to generate the PDF.",
      },
      "Service Ticket created without a PDF."
    );
  }
});

export { createServiceTicket };
