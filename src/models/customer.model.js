import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    // Customer Information
    customerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    emailForInspectionReports: { type: String, required: true },
    onSiteContactName: { type: String, required: true },
    onSitePhoneNumber: { type: String, required: true },
    onSiteEmailAddress: { type: String, required: true },

    // Site Information
    buildingName: { type: String, required: true },
    typeOfSite: { type: String, required: true },
    siteAddress: { type: String, required: true },

    // Billing Information
    billingName: { type: String, required: true },
    billingContactNumber: { type: String, required: true },
    billingEmailAddress: { type: String, required: true },

    // Owner’s Information
    ownerName: { type: String, required: true },
    ownerContactNumber: { type: String, required: true },
    ownerAddress: { type: String, required: true },
    ownerEmailAddress: { type: String, required: true },

    // Certificates
    taxExemptCertificate: {
      type: String,
      enum: ['Yes', 'No', 'N/A'], // Restricts values to this list
      default: 'N/A',             // Sets the default to N/A
    },
    directPayCertificate: {
      type: String,
      enum: ['Yes', 'No', 'N/A'], // Restricts values to this list
      default: 'N/A',             // Sets the default to N/A
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

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
