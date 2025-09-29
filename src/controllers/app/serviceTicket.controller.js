import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import serviceTicket from "#models/serviceTicket.model.js";

const createServiceTicket = asyncHandler(async (req, res) => {
  const body = req.body;
  const { _id } = req.user;



  // Create the new customer
  const ticket = await serviceTicket.create({ ...body, createdBy: _id });

  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { ticket },
    "Service Ticket created successfully"
  );
});

export { createServiceTicket };