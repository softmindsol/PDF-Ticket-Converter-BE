import mongoose from "mongoose";

const CommunicatorSchema = new mongoose.Schema({
  areaNumber: {
    type: Number,
    required: true,
  },
  zoneNumber: {
    type: Number,
    required: true,
  },
  zoneDescription: {
    type: String,
    trim: true,
  },
  partitionAreaDescription: {
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
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    dealerName: {
      type: String,
      required: true,
      trim: true,
    },
    dealerCode: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    subscriberName: {
      type: String,
      required: true,
      trim: true,
    },
    installationAddress: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zip: {
      type: String,
      required: true,
      trim: true,
    },
    communicatorFormat: [CommunicatorSchema],
    monitor: {
      type: String,
      required: true,
      trim: true,
    },
    dealer: {
      type: String,
      required: false,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Alarm", AlarmSchema);
