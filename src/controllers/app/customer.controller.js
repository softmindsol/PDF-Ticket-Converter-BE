import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import Customer from "#models/customer.model.js";

const createCustomer = asyncHandler(async (req, res) => {
  const body = req.body;
  const { _id } = req.user;

  // Check if a customer with the same name already exists
  const existingCustomer = await Customer.findOne({ customerName: body.customerName });
  if (existingCustomer) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A customer with this name already exists",
      [{ customerName: "Customer name is already taken" }]
    );
  }

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