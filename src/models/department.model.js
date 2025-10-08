import mongoose from "mongoose";
import { isManager } from "#validations/mongo/department.js";

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false },
    doc: [
      {
        type: String,
        required: true,
      },
    ],

    allowedForms: {
      type: [String],
      enum: ["AboveGround", "serviceTicket", "underGround", "workOrder"],
      default: [],
    },

    manager: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      validate: {
        validator: isManager,
        message: "Manager must be a user with the 'manager' role.",
      },
    }],
  },
  { timestamps: true }
);

export default mongoose.model("Department", DepartmentSchema);
