import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    role: { type: String, enum: ["user", "advocate", "admin", "super-admin"], default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    
    
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
