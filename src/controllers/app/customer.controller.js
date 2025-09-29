import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import Customer from "#models/customer.model.js";

const createCustomer = asyncHandler(async (req, res) => {
  const body = req.body;
  const { _id } = req.user;



  // Create the new customer
  const newCustomer = await Customer.create({ ...body, createdBy: _id });

  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { customer: newCustomer },
    "Customer created successfully"
  );
});

export { createCustomer };