import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import AboveGround from "#models/aboveGroundTest.model.js";

const createAboveGroundTicket = asyncHandler(async (req, res) => {
  const body = req.body;
  const { _id } = req.user;



  // Create the new customer
  const ticket = await AboveGround.create({ ...body, createdBy: _id });

  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { ticket },
    "Above Ground Ticket created successfully"
  );
});

export { createAboveGroundTicket };