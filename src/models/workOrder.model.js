import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  unitCost: {
    type: Number,
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  taxRate: {
    type: Number,
    required: true,
  },
});

const WorkOrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    emailAddress: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },

    jobNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    technicianName: {
      type: String,
      required: true,
    },
    contactName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "check", "credit", 'n/a'],
    },

    materialList: [materialSchema],

    date: {
      type: Date,
      required: true,
    },

    customerSignature: {
      type: String,
    },
    printName: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticket: { type: String, required: false, default: "" },
  },
  { timestamps: true }
);

const WorkOrder = mongoose.model("WorkOrder", WorkOrderSchema);

export default WorkOrder;
