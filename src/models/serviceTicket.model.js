import mongoose from "mongoose";

const WorkOrderItemSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  material: {
    type: String,
    required: true,
    trim: true,
  },
});

const ServiceTicketSchema = new mongoose.Schema(
  {
    // Job and Customer Information
    jobName: {
      type: String,
      required: true,
      trim: true,
    },
    laborCost: {
      type: String,
      required: true,
      trim: true,
    },
    materialCost: {
      type: String,
      required: true,
      trim: true,
    },
    totalCost: {
      type: String,
      required: true,
      trim: true,
    },
    jobNumber: {
      type: String,
      required: true,
      trim: true,
    },
    workorderNumber: {
      type: String,
      required: true,
      trim: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    emailAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // Emails are case-insensitive
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    jobLocation: {
      type: String,
      required: true,
      trim: true,
    },

    // Work Details
    workDescription: {
      type: String,
      required: true,
      trim: true,
    },
    materials: [WorkOrderItemSchema], // Array of materials and quantities

    // Labor Information
    staff: [
      {
        technicianName: {
          type: String,
          required: true,
          trim: true,
        },
        technicianContactNumber: {
          type: String,
          required: true,
          trim: true,
        },
        stHours: {
          type: Number,
          default: 0, // Default to 0 if not provided
        },
        otHours: {
          type: Number,
          default: 0, // Default to 0 if not provided
        },
      },
    ],

    // Status and Financials
    applySalesTax: {
      type: Boolean,
      default: false,
    },
    workOrderStatus: {
      type: String,
      required: true,
      enum: ["Not Complete", "System Out of Order", "Complete"], // Restricts values to this list
      default: "Not Complete",
    },
    completionDate: {
      type: Date,
      default: Date.now,
    },
    customerSignature: {
      type: String, // Often a URL to the signature image
      trim: true,
    },
    printName: {
      type: String, // Often a URL to the signature image
      trim: true,
    },
    ticket: { type: String, required: false, default: "" },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Department Relationship
    // department: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Department",
    //   required: true,
    // },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceTicket", ServiceTicketSchema);
