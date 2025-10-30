import httpStatus from "http-status";
import { ApiResponse, asyncHandler } from "#utils/api.utils.js";

import AboveGroundTest from "#models/aboveGroundTest.model.js";
import UnderGroundTest from "#models/underGroundTest.model.js";
import ServiceTicket from "#models/serviceTicket.model.js";
import WorkOrder from "#models/workOrder.model.js";
import Customer from "#models/customer.model.js";

const getMyLatestTickets = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { limit = 10, page = 1 } = req.query;

  const modelsToQuery = [
    { model: AboveGroundTest, type: "Above Ground" },
    { model: UnderGroundTest, type: "Under Ground" },
    { model: ServiceTicket, type: "Service Ticket" },
    { model: WorkOrder, type: "Work Order" },
    { model: Customer, type: "Customer" },
  ];

  const promises = modelsToQuery.map(async ({ model, type }) => {
    const documents = await model
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .lean();

    return documents.map((doc) => ({ ...doc, type }));
  });

  const results = await Promise.all(promises);

  const allTickets = results.flat();

  allTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedTickets = allTickets.slice(startIndex, endIndex);

  return new ApiResponse(
    res,
    httpStatus.OK,
    {
      tickets: paginatedTickets,
      total: allTickets.length,
      currentPage: Number(page),
      totalPages: Math.ceil(allTickets.length / limit),
    },
    "Successfully retrieved the latest tickets."
  );
});

export { getMyLatestTickets };
