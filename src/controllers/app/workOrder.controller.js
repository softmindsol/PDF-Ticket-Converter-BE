import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import WorkOrder from "#models/workOrder.model.js";
import { generateWorkOrderHtml } from "#root/src/services/work-order.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";

const WorkOrderTicket = asyncHandler(async (req, res) => {
  const body = req.body;
  const { jobNumber } = body;
  const { _id } = req.user;

  const existingWorkOrder = await WorkOrder.findOne({ jobNumber });

  if (existingWorkOrder) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A work order with this job number already exists."
    );
  }

  const newWorkOrder = await WorkOrder.create({ ...body, createdBy: _id });

  try {
    const html = await generateWorkOrderHtml(newWorkOrder);

    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newWorkOrder._id}-${safeTimestamp}.pdf`;

    const pdfData = await savePdfToFile(html, newFileName, "work-order");
    console.log("🚀 ~ PDF Data:", pdfData);

    newWorkOrder.ticket = pdfData?.url;

    const updatedWorkOrder = await newWorkOrder.save();

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
