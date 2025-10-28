import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import WorkOrder from "#models/workOrder.model.js";
import User from "#models/user.model.js";
import { generateWorkOrderHtml } from "#root/src/services/work-order.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";
import { sendEmailWithS3Attachment } from "#root/src/services/sendgrid.service.js";

const WorkOrderTicket = asyncHandler(async (req, res) => {
  const { jobNumber } = req.body;

  const existingWorkOrder = await WorkOrder.findOne({ jobNumber });
  if (existingWorkOrder) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A work order with this job number already exists."
    );
  }

  const newWorkOrder = await WorkOrder.create({
    ...req.body,
    createdBy: req.user._id,
  });

  try {
    const html = await generateWorkOrderHtml(newWorkOrder);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newWorkOrder._id}-${safeTimestamp}.pdf`;

    const pdfData = await savePdfToFile(html, newFileName, "work-order");

    newWorkOrder.ticket = pdfData?.url;
    const updatedWorkOrder = await newWorkOrder.save();

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
          const subject = `New Work Order Created: Job #${updatedWorkOrder.jobNumber}`;
          const htmlContent = `
            <p>Hello,</p>
            <p>A new Work Order for job <strong>#${updatedWorkOrder.jobNumber}</strong> has been created by ${req.user.firstName} ${req.user.lastName}.</p>
            <p>The work order PDF is attached for your review.</p>
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
          "Failed to send manager notification email for new work order, but the work order was created successfully.",
          emailError
        );
      }
    }

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      { ticket: updatedWorkOrder },
      "Work Order Ticket and PDF created successfully."
    );
  } catch (pdfError) {
    console.error("Failed to generate PDF for work order:", pdfError);

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      {
        ticket: newWorkOrder,
        warning:
          "Work Order Ticket was created, but failed to generate the PDF.",
      },
      "Work Order Ticket created without a PDF."
    );
  }
});

export { WorkOrderTicket };
