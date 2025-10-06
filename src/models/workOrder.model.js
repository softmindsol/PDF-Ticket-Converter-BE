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
      required: true,
      unique: true, 
    },
    technicianName: {
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
    },

    materialList: [materialSchema], 

    date: {
      type: Date,
      required: true,
    },

    customerSignature: {
      type: String, 
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const WorkOrder = mongoose.model("WorkOrder", WorkOrderSchema);

export default WorkOrder;