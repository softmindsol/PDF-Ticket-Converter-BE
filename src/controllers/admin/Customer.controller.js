import Customer from "#models/customer.model.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";
import { generateCustomerProfileHtml } from "#root/src/services/customer.pdf.js";
import { savePdfToFile } from "#config/puppeteer.config.js";
import userModel from "#root/src/models/user.model.js";
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
  const html = await generateCustomerProfileHtml(newCustomer);
  const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const newFileName = `${newCustomer?._id}-${safeTimestamp}.pdf`;
  const fileName = await savePdfToFile(html, newFileName, "customers");
  console.log("🚀 ~ fileName:", fileName);
  newCustomer.ticket = fileName?.url;
  const updatedCustomerWithPdf = await newCustomer.save();
  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { customer: updatedCustomerWithPdf },
    "Customer created successfully."
  );
});

const getCustomers = asyncHandler(async (req, res) => {
  const searchableFields = [
    "customerName",
    "phoneNumber",
    "emailForInspectionReports",
    "buildingName",
  ];

  let serverSideFilters = {};

  if (req.user.role === "admin") {
    if (req.query.department) {
      const usersInDepartment = await userModel
        .find({ department: req.query.department })
        .select("_id");

      const userIds = usersInDepartment.map((user) => user._id);

      serverSideFilters.createdBy = { $in: userIds };
    }
  } else {
    if (req.user.department?._id) {
      const usersInDepartment = await userModel
        .find({ department: req.user.department._id })
        .select("_id");

      const userIds = usersInDepartment.map((user) => user._id);
      serverSideFilters.createdBy = { $in: userIds };
    } else {
      serverSideFilters.createdBy = null;
    }
  }

  const baseQuery = Customer.find(serverSideFilters).populate(
    "createdBy",
    "username"
  );

  const features = new ApiFeatures(baseQuery, req.query)
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
  const customer = await Customer.findById(id).populate(
    "createdBy",
    "username"
  );
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
    // ... (include all other fields from req.body)
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

  // Regenerate and replace the ticket
  const html = await generateCustomerProfileHtml(updatedCustomer);
  const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const newFileName = `${updatedCustomer?._id}-${safeTimestamp}.pdf`;
  const fileName = await savePdfToFile(html, newFileName, "customers");

  updatedCustomer.ticket = fileName?.url;
  const updatedCustomerWithPdf = await updatedCustomer.save();

  return new ApiResponse(
    res,
    httpStatus.OK,
    { customer: updatedCustomerWithPdf },
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

export {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
