import httpStatus from "http-status";
import { ApiResponse, asyncHandler } from "#utils/api.utils.js";

// Import all the models
import AboveGroundTest from "#models/aboveGroundTest.model.js";
import UnderGroundTest from "#models/underGroundTest.model.js";
import ServiceTicket from "#models/serviceTicket.model.js";
import WorkOrder from "#models/workOrder.model.js";
import Customer from "#models/customer.model.js";
import User from "#models/user.model.js"; // <-- Import the User model
import alarmMonitorModel from "#root/src/models/alarmMonitor.model.js";

const getMyLatestTickets = asyncHandler(async (req, res) => {
  const { _id: userId, role, department } = req.user;
  const { limit = 10, page = 1 } = req.query;

  // 1. Determine the correct database filter based on the user's role
  let filter = {};

  if (role === "manager") {
    // For managers, find all users within their department
    if (!department?._id) {
      // If a manager has no department, they can't see any tickets.
      return new ApiResponse(
        res,
        httpStatus.OK,
        { tickets: [], total: 0, currentPage: 1, totalPages: 0 },
        "Manager is not assigned to a department."
      );
    }
    
    const usersInDepartment = await User.find({ department: department._id }).select("_id").lean();
    const userIdsInDepartment = usersInDepartment.map(user => user._id);
    
    filter = { createdBy: { $in: userIdsInDepartment } };

  } else if (role === "user") {
    // For regular users, only show their own created documents
    filter = { createdBy: userId };
  }
  // For Admins, the filter remains {}, which will fetch all documents.

  // 2. Define the models to query
  const modelsToQuery = [
    { model: AboveGroundTest, type: "Above Ground" },
    { model: UnderGroundTest, type: "Under Ground" },
    { model: ServiceTicket, type: "Service Ticket" },
    { model: WorkOrder, type: "Work Order" },
    { model: Customer, type: "Customer" },
        { model: alarmMonitorModel, type: "Alarm" }, // 2. Added the new Alarm model to the query list

  ];

  // 3. Execute the queries in parallel using the dynamically created filter
  const promises = modelsToQuery.map(async ({ model, type }) => {
    const documents = await model
      .find(filter) // <-- Use the dynamic filter here
      .sort({ createdAt: -1 })
      .lean();

    return documents.map((doc) => ({ ...doc, type }));
  });

  const results = await Promise.all(promises);
  const allTickets = results.flat();

  // 4. Sort and paginate the combined results
  allTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedTickets = allTickets.slice(startIndex, endIndex);

  // 5. Send the final response
  return new ApiResponse(
    res,
    httpStatus.OK,
    {
      tickets: paginatedTickets,
      pagination: {
        totalItems: allTickets.length,
        totalPages: Math.ceil(allTickets.length / limit),
        currentPage: Number(page),
        itemsPerPage: limit
      }
    },
    "Successfully retrieved the latest tickets."
  );
});

export { getMyLatestTickets };