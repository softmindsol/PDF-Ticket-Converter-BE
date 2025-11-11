import mongoose from "mongoose";

const CommunicatorSchema = new mongoose.Schema({
  areaNumber: {
    type: Number,
    required: false,
  },
  zoneNumber: {
    type: Number,
    required: false,
  },
  zoneDescription: {
    type: String,
    trim: true,
  },
  partitionAreaDescription: {
    type: String,
    trim: true,
  },
  codeDescription: {
    type: String,
    trim: true,
  },
  instruction1: {
    type: String,
    enum: ["VN", "NA", "NC", "ND", "NG"],
    default: "VN",
  },
  instruction2: {
    type: String,
    enum: ["VN", "NA", "NC", "ND", "NG"],
    default: "VN",
  },
  instruction3: {
    type: String,
    enum: ["VN", "NA", "NC", "ND", "NG"],
    default: "VN",
  },
  instruction4: {
    type: String,
    enum: ["VN", "NA", "NC", "ND", "NG"],
    default: "VN",
  },
});

const AlarmSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
    communicatorFormat: {
      type: String,
      required: false,
      trim: true,
    },
    dealerName: {
      type: String,
      required: false,
      trim: true,
    },
    dealerCode: {
      type: String,
      required: false,
      trim: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    subscriberName: {
      type: String,
      required: false,
      trim: true,
    },
    installationAddress: {
      type: String,
      required: false,
      trim: true,
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    state: {
      type: String,
      required: false,
      trim: true,
    },
    zip: {
      type: String,
      required: false,
      trim: true,
    },
    areas: [CommunicatorSchema],
    monitorSign: {
      type: String,
      required: false,
      trim: true,
    },
    dealerSign: {
      type: String,
      required: false,
      trim: true,
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

export default mongoose.model("Alarm", AlarmSchema);
