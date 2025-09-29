import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import underGroundTest from "#models/underGroundTest.model.js";

const underGroundTicket = asyncHandler(async (req, res) => {
  const body = req.body;
  const { _id } = req.user;



  // Create the new customer
  const ticket = await underGroundTest.create({ ...body, createdBy: _id });

  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { ticket },
    "UnderGround Ticket created successfully"
  );
});

export { underGroundTicket };