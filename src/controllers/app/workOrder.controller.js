import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import WorkOrder from "#models/workOrder.model.js";
import User from "#models/user.model.js";
import { generateWorkOrderHtml } from "#root/src/services/work-order.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";
import { sendEmailWithS3Attachment } from "#root/src/services/sendgrid.service.js";
import { uploadBase64ToS3 } from "#root/src/utils/base64.util.js";
import { CLIENT_URL } from "#root/src/config/env.config.js"; // Imported CLIENT_URL

const WorkOrderTicket = asyncHandler(async (req, res) => {
  if (req.body?.customerSignature) {
    req.body.customerSignature = await uploadBase64ToS3(
      req.body.customerSignature,
      "signature"
    );
  }
  const { jobNumber } = req.body;



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
          const subjectSuffix = updatedWorkOrder.jobNumber ? `: Job #${updatedWorkOrder.jobNumber}` : "";
          const subject = `New Work Order Created${subjectSuffix}`;

          // Construct the direct link to the work order
          const ticketUrl = `${CLIENT_URL}/work-order/${updatedWorkOrder._id}`;

          const jobHtml = updatedWorkOrder.jobNumber ? ` for job <strong>#${updatedWorkOrder.jobNumber}</strong>` : "";
          const htmlContent = `
            <p>Hello,</p>
            <p>A new Work Order${jobHtml} has been created by ${req.user.firstName} ${req.user.lastName}.</p>
            <p>You can view the work order directly here: <a href="${ticketUrl}">View Work Order</a>.</p>
            <p>The work order PDF is also attached for your review.</p>
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
      { workOrder: updatedWorkOrder },
      "Work Order and PDF created successfully."
    );
  } catch (pdfError) {
    console.error("Failed to generate PDF for work order:", pdfError);

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      {
        workOrder: newWorkOrder,
        warning: "Work Order was created, but failed to generate the PDF.",
      },
      "Work Order created without a PDF."
    );
  }
});

export { WorkOrderTicket };
