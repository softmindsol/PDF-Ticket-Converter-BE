import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import WorkOrder from "#models/workOrder.model.js";

const WorkOrderTicket = asyncHandler(async (req, res) => {
  const body = req.body;
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
