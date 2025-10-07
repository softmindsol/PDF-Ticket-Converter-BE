import Customer from "#models/customer.model.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";

const createCustomer = asyncHandler(async (req, res) => {
  const {
    customerName,
    phoneNumber,
    emailForInspectionReports,
    onSiteContactName,
    onSitePhoneNumber,
    onSiteEmailAddress,
    buildingName,
    typeOfSite,
    siteAddress,
    billingName,
    billingContactNumber,
    billingEmailAddress,
    ownerName,
    ownerContactNumber,
    ownerAddress,
    ownerEmailAddress,
    taxExemptCertificate,
    directPayCertificate,
  } = req.body;

  const existingCustomer = await Customer.findOne({ customerName });
  if (existingCustomer) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A customer with this name already exists.",
      [{ customerName: "Customer name is already taken" }]
    );
  }

  const newCustomer = await Customer.create({
    customerName,
    phoneNumber,
    emailForInspectionReports,
    onSiteContactName,
    onSitePhoneNumber,
    onSiteEmailAddress,
    buildingName,
    typeOfSite,
    siteAddress,
    billingName,
    billingContactNumber,
    billingEmailAddress,
    ownerName,
    ownerContactNumber,
    ownerAddress,
    ownerEmailAddress,
    taxExemptCertificate,
    directPayCertificate,
    createdBy: req.user._id,
  });

  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { customer: newCustomer },
    "Customer created successfully."
  );
});

const getCustomers = asyncHandler(async (req, res) => {
  const searchableFields = ["customerName", "phoneNumber", "emailForInspectionReports", "buildingName"];

  const features = new ApiFeatures(
    Customer.find().populate("createdBy", "username"),
    req.query
  )
    .filter(searchableFields)
    .sort()
    .limitFields();

  const { documents: customers, pagination } = await features.execute();

  return new ApiResponse(
    res,
    httpStatus.OK,
    { customers, pagination },
    "Customers retrieved successfully."
  );
});

const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await Customer.findById(id).populate("createdBy", "username");
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Customer not found.");
  }
  return new ApiResponse(
    res,
    httpStatus.OK,
    { customer },
    "Customer retrieved successfully."
  );
});

const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    customerName,
    phoneNumber,
    emailForInspectionReports,
    onSiteContactName,
    onSitePhoneNumber,
    onSiteEmailAddress,
    buildingName,
    typeOfSite,
    siteAddress,
    billingName,
    billingContactNumber,
    billingEmailAddress,
    ownerName,
    ownerContactNumber,
    ownerAddress,
    ownerEmailAddress,
    taxExemptCertificate,
    directPayCertificate,
  } = req.body;

  if (customerName) {
    const existingCustomer = await Customer.findOne({ customerName });
    if (existingCustomer && existingCustomer._id.toString() !== id) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "This customer name is already in use by another customer.",
        [{ customerName: "Customer name is already taken" }]
      );
    }
  }

  const updatedCustomer = await Customer.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!updatedCustomer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Customer not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { customer: updatedCustomer },
    "Customer details updated successfully."
  );
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await Customer.findByIdAndDelete(id);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Customer not found.");
  }
  return new ApiResponse(
    res,
    httpStatus.OK,
    null,
    "Customer deleted successfully."
  );
});

export { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer };