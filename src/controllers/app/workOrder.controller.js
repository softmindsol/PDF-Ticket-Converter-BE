import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import WorkOrder from "#models/workOrder.model.js";
import { TemplateHandler } from 'easy-template-x';
import * as fs from 'fs';

const WorkOrderTicket = asyncHandler(async (req, res) => {
  const body = req.body;
  console.log("🚀 ~ body:", body);
  const { _id } = req.user;

  const ticket = await WorkOrder.create({ ...body, createdBy: _id });

  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { ticket },
    "Work Order Ticket created successfully"
  );
});

export { WorkOrderTicket };
