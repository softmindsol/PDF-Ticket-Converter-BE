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
  // --- 1. Department & Security Filtering ---
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
      // Non-admin users with no department see nothing
      serverSideFilters.createdBy = null;
    }
  }

  // This will be our master filter object
  const finalQueryFilters = { ...serverSideFilters };

  // --- 2. Advanced Search Term Filtering ---
  if (req.query.search) {
    const searchTerm = req.query.search.trim();
    const searchRegex = new RegExp(searchTerm, "i");
    const userSearchOrConditions = [
      { username: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex },
    ];
    const nameParts = searchTerm.split(" ").filter(Boolean);
    if (nameParts.length > 1) {
      const part1Regex = new RegExp(nameParts[0], "i");
      const part2Regex = new RegExp(nameParts[1], "i");
      userSearchOrConditions.push({ $and: [{ firstName: part1Regex }, { lastName: part2Regex }] });
      userSearchOrConditions.push({ $and: [{ firstName: part2Regex }, { lastName: part1Regex }] });
    }
    const matchingUsers = await userModel.find({ $or: userSearchOrConditions }).select("_id");
    const matchingUserIds = matchingUsers.map((user) => user._id);
    const mainSearchOrConditions = [
      { customerName: searchRegex },
      { phoneNumber: searchRegex },
      { emailForInspectionReports: searchRegex },
      { buildingName: searchRegex },
    ];
    if (matchingUserIds.length > 0) {
      mainSearchOrConditions.push({ createdBy: { $in: matchingUserIds } });
    }
    finalQueryFilters.$or = mainSearchOrConditions;
  }

  // --- 3. Date Range and Other Direct Filtering ---
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields", "search", "department"];
  excludedFields.forEach((el) => delete queryObj[el]);

  Object.keys(queryObj).forEach((key) => {
    const match = key.match(/(.+)\[(gte|gt|lte|lt)\]/);

    if (match) {
      const field = match[1]; // e.g., 'createdAt'
      let operator = match[2];
      let value = queryObj[key];

      // ** FIX for the "Midnight Problem" **
      if (operator === "lte") {
        operator = "lt"; // Change to "less than"
        const endDate = new Date(value);
        endDate.setDate(endDate.getDate() + 1); // Increment to the next day
        value = endDate.toISOString().split('T')[0]; // Format back to 'YYYY-MM-DD'
      }

      if (!finalQueryFilters[field]) {
        finalQueryFilters[field] = {};
      }
      finalQueryFilters[field][`$${operator}`] = value;
    } else {
      // Handle other direct filters
      finalQueryFilters[key] = queryObj[key];
    }
  });

  // --- 4. Database Query Execution ---
  // The single .find() call now contains ALL combined filters
  const baseQuery = Customer.find(finalQueryFilters).populate(
    "createdBy",
    "username firstName lastName"
  );

  // CRITICAL: .filter() is no longer called here.
  const features = new ApiFeatures(baseQuery, req.query).sort().limitFields();

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
