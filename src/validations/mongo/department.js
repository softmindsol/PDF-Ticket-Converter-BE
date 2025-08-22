import userModel from "#models/user.model.js";

export async function isManager(userId) {
  try {
    const user = await userModel.findById(userId);
    return !!(user && user.role === "manager");
  } catch (error) {
    return false;
  }
}

export function isDepartmentRequired() {
    return this.role !== "admin";
  }
  