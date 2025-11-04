import Alarm from "#models/alarmMonitor.model.js";
import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import ApiFeatures from "#root/src/utils/apiFeatures.util.js";
import userModel from "#root/src/models/user.model.js";

const createAlarm = asyncHandler(async (req, res) => {
  const { accountNumber } = req.body;

  const existingAlarm = await Alarm.findOne({ accountNumber });
  if (existingAlarm) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "An alarm with this account number already exists.",
      [{ accountNumber: "Account number is already in use" }]
    );
  }

  const alarmData = {
    ...req.body,
    createdBy: req.user._id,
  };

  const newAlarm = await Alarm.create(alarmData);

  return new ApiResponse(
    res,
    httpStatus.CREATED,
    { alarm: newAlarm },
    "Alarm created successfully."
  );
});

const getAlarms = asyncHandler(async (req, res) => {
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

  const finalQueryFilters = { ...serverSideFilters };

  // --- 2. Advanced Search Term Filtering (Corrected Logic) ---
  if (req.query.search) {
    const searchTerm = req.query.search.trim();
    const searchRegex = new RegExp(searchTerm, "i");

    // First, find users matching the search term (username, firstName, lastName)
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

    // Build the main search conditions for the Alarm model
    const mainSearchOrConditions = [
      { accountNumber: searchRegex },
      { dealerName: searchRegex },
      { dealerCode: searchRegex },
      { subscriberName: searchRegex },
      { installationAddress: searchRegex },
      { city: searchRegex },
      { state: searchRegex },
      { zip: searchRegex },
    ];

    // If we found users that match the search term, add them to the main search criteria
    if (matchingUserIds.length > 0) {
      mainSearchOrConditions.push({ createdBy: { $in: matchingUserIds } });
    }

    finalQueryFilters.$or = mainSearchOrConditions;
  }

  // --- 3. Date Range and Other Direct Filtering ---
  const queryObj = { ...req.query };

  const excludedFields = [
    "page",
    "sort",
    "limit",
    "fields",
    "search",
    "department",
  ];
  excludedFields.forEach((el) => delete queryObj[el]);

  Object.keys(queryObj).forEach((key) => {
    const match = key.match(/(.+)\[(gte|gt|lte|lt)\]/);

    if (match) {
      const field = match[1];
      let operator = match[2];
      let value = queryObj[key];

      if (operator === "lte") {
        operator = "lt";
        const endDate = new Date(value);
        endDate.setDate(endDate.getDate() + 1);
        value = endDate.toISOString().split("T")[0];
      }

      if (!finalQueryFilters[field]) {
        finalQueryFilters[field] = {};
      }
      finalQueryFilters[field][`$${operator}`] = value;
    } else {
      finalQueryFilters[key] = queryObj[key];
    }
  });

  // --- 4. Database Query Execution ---
  const baseQuery = Alarm.find(finalQueryFilters).populate(
    "createdBy",
    "username firstName lastName" // Populating all necessary fields
  );

  const features = new ApiFeatures(baseQuery, req.query).sort().limitFields();

  const { documents: alarms, pagination } = await features.execute();

  return new ApiResponse(
    res,
    httpStatus.OK,
    { alarms, pagination },
    "Alarms retrieved successfully."
  );
});

const getAlarmById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const alarm = await Alarm.findById(id);

  if (!alarm) {
    throw new ApiError(httpStatus.NOT_FOUND, "Alarm not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { alarm },
    "Alarm retrieved successfully."
  );
});

const updateAlarm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { accountNumber } = req.body;

  if (accountNumber) {
    const existingAlarm = await Alarm.findOne({ accountNumber });
    if (existingAlarm && existingAlarm._id.toString() !== id) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "This account number is already in use by another alarm.",
        [{ accountNumber: "Account number is already taken" }]
      );
    }
  }

  const updatedAlarm = await Alarm.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!updatedAlarm) {
    throw new ApiError(httpStatus.NOT_FOUND, "Alarm not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    { alarm: updatedAlarm },
    "Alarm updated successfully."
  );
});

const deleteAlarm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const alarm = await Alarm.findByIdAndDelete(id);

  if (!alarm) {
    throw new ApiError(httpStatus.NOT_FOUND, "Alarm not found.");
  }

  return new ApiResponse(
    res,
    httpStatus.OK,
    null,
    "Alarm deleted successfully."
  );
});

export { createAlarm, getAlarms, getAlarmById, updateAlarm, deleteAlarm };
