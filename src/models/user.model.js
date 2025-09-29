import mongoose from "mongoose";
import { isDepartmentRequired } from "#validations/mongo/department.js";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: false, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: false },
    role: { type: String, enum: ["user", "manager", "admin"], default: "admin" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    department: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: isDepartmentRequired,
    },
    isDeleted: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
