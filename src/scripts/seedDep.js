import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import departmentModel from "../models/department.model.js";

const departmentNames = [
  "DW (Day Work)",
  "The Hub",
  "GC (Gulf Coast)",
  "AL (Alabama)",
  "Inspection",
  "Alarm",
  "FP (Fire Protection)", 
  "TF (Tenant Fit Out)",
];

/**
 * The main seeding function.
 */
const seedDepartments = async () => {
  try {
    await connectDB();

    const departmentsToInsert = departmentNames.map((name) => ({ name }));

    console.log("Clearing existing departments...");
    await departmentModel.deleteMany({ name: { $in: departmentNames } });
    console.log("Existing departments cleared. Seeding new data...");

    await departmentModel.insertMany(departmentsToInsert);

    console.log(
      `✅ Success! Seeded ${departmentsToInsert.length} departments into the database.`
    );
  } catch (error) {
    console.error("❌ An error occurred during the seeding process:", error);
    process.exit(1);
  } finally {
    console.log("Closing database connection...");
    await mongoose.disconnect();
    console.log("Connection closed.");
  }
};

seedDepartments();
