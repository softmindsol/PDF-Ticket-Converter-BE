import ServiceTicket from "#models/serviceTicket.model.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";
import { generateServiceTicketHtml } from "#root/src/services/service-ticket.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";
import userModel from "#root/src/models/user.model.js";

const createServiceTicket = asyncHandler(async (req, res) => {
  const newServiceTicket = await ServiceTicket.create({
    ...req.body,
    createdBy: req.user._id,
  });

  try {
    const html = await generateServiceTicketHtml(newServiceTicket);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newServiceTicket._id}-${safeTimestamp}.pdf`;

    const pdfData = await savePdfToFile(html, newFileName, "service-tickets", `${newServiceTicket?.printName||newServiceTicket?._id}.pdf` );
    console.log("🚀 ~ PDF Data:", pdfData);

    newServiceTicket.ticket = pdfData?.url;

    const updatedServiceTicket = await newServiceTicket.save();

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      { serviceTicket: updatedServiceTicket },
      "Service Ticket and PDF created successfully."
    );
  } catch (pdfError) {
    console.error("Failed to generate PDF for service ticket:", pdfError);

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      {
        serviceTicket: newServiceTicket,
        warning:
          "Service Ticket was created, but failed to generate PDF profile.",
      },
      "Service Ticket created without a PDF."
    );
  }
});



const getServiceTickets = asyncHandler(async (req, res) => {
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
      { jobName: searchRegex },
      { customerName: searchRegex },
      { emailAddress: searchRegex },
      { technicianName: searchRegex },
      { jobLocation: searchRegex },
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
      const field = match[1]; // e.g., 'completionDate' or 'createdAt'
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
  const baseQuery = ServiceTicket.find(finalQueryFilters).populate(
    "createdBy",
    "username firstName lastName"
  );

  // CRITICAL: .filter() is no longer called here.
  const features = new ApiFeatures(baseQuery, req.query).sort().limitFields();

  const { documents: serviceTickets, pagination } = await features.execute();

  return new ApiResponse(
    res,
    httpStatus.OK,
    { serviceTickets, pagination },
    "Service Tickets retrieved successfully."
  );
});

const getServiceTicketById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const serviceTicket = await ServiceTicket.findById(id).populate(
    "createdBy",
    "username"
  );

  if (!serviceTicket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service Ticket not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { serviceTicket },
    "Service Ticket retrieved successfully."
  );
});

const updateServiceTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedServiceTicket = await ServiceTicket.findByIdAndUpdate(
    id,
    { $set: req.body },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedServiceTicket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service Ticket not found.");
  }

  try {
    const html = await generateServiceTicketHtml(updatedServiceTicket);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${updatedServiceTicket._id}-${safeTimestamp}.pdf`;

    const pdfData = await savePdfToFile(html, newFileName, "service-tickets", `${updatedServiceTicket?.printName||updatedServiceTicket?._id}.pdf`);
    console.log("🚀 ~ PDF Data on update:", pdfData);

    updatedServiceTicket.ticket = pdfData?.url;

    const finalServiceTicket = await updatedServiceTicket.save();

    return new ApiResponse(
      res,
      httpStatus.OK,
      { serviceTicket: finalServiceTicket },
      "Service Ticket updated and PDF regenerated successfully."
    );
  } catch (pdfError) {
    console.error("Failed to regenerate PDF for service ticket:", pdfError);

    return new ApiResponse(
      res,
      httpStatus.OK,
      {
        serviceTicket: updatedServiceTicket,
        warning:
          "Service Ticket was updated, but failed to regenerate PDF profile.",
      },
      "Service Ticket updated without a new PDF."
    );
  }
});

const deleteServiceTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const serviceTicket = await ServiceTicket.findByIdAndDelete(id);

  if (!serviceTicket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service Ticket not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    null,
    "Service Ticket deleted successfully."
  );
});

export {
  createServiceTicket,
  getServiceTickets,
  getServiceTicketById,
  updateServiceTicket,
  deleteServiceTicket,
};
