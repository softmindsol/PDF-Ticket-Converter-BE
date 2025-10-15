import httpStatus from "http-status";
import { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ServiceTicket from "#models/serviceTicket.model.js";

const createServiceTicket = asyncHandler(async (req, res) => {
  const body = req.body;

  const { _id } = req.user;

  const ticket = await ServiceTicket.create({ ...body, createdBy: _id });

  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { ticket },
    "Service Ticket created successfully"
  );
});

export { createServiceTicket };
