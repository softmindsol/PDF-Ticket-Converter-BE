import mongoose from "mongoose";

const { Schema, model } = mongoose;

const sprinklerSchema = new Schema({
  make: String,
  model: String,
  yearOfMfg: Number,
  orificeSize: String,
  quantity: Number,
  tempRating: String,
});

const alarmDeviceSchema = new Schema({
  type: String,
  make: String,
  model: String,
  maxOperationTime: {
    min: Number,
    sec: Number,
  },
});

const dryPipeOperatingTestSchema = new Schema({
  dryValve: {
    make: String,
    model: String,
    serialNumber: String,
  },
  qodValve: {
    make: String,
    model: String,
    serialNumber: String,
  },
  timeToTripWithoutQOD: {
    min: Number,
    sec: Number,
  },
  timeToTripWithQOD: {
    min: Number,
    sec: Number,
  },
  waterPressureWithoutQOD: Number,
  waterPressureWithQOD: Number,
  airPressureWithoutQOD: Number,
  airPressureWithQOD: Number,
  tripPointAirPressureWithoutQOD: Number,
  tripPointAirPressureWithQOD: Number,
  timeWaterReachedOutletWithoutQOD: {
    min: Number,
    sec: Number,
  },
  timeWaterReachedOutletWithQOD: {
    min: Number,
    sec: Number,
  },
  alarmOperatedProperlyWithoutQOD: Schema.Types.Mixed,
  alarmOperatedProperlyWithQOD: Schema.Types.Mixed,
  explain: String,
});

const delugePreActionValveSchema = new Schema({
  operation: {
    type: String,
    enum: ["pneumatic", "electric", "hydraulic"],
  },
  isPipingSupervised: Schema.Types.Mixed,
  isDetectingMediaSupervised: Schema.Types.Mixed,
  operatesFromManualOrRemote: Schema.Types.Mixed,
  isAccessibleForTesting: Schema.Types.Mixed,
  explanation: String,
  make: String,
  model: String,
  doesSupervisionLossAlarmOperate: Schema.Types.Mixed,
  doesValveReleaseOperate: Schema.Types.Mixed,
  maxTimeToOperateRelease: {
    min: Number,
    sec: Number,
  },
});

const pressureReducingValveTestSchema = new Schema({
  locationAndFloor: String,
  makeAndModel: String,
  setting: String,
  staticPressure: {
    inlet: Number,
    outlet: Number,
  },
  residualPressure: {
    inlet: Number,
    outlet: Number,
  },
  flowRate: Number,
});

const signatureSchema = new Schema({
  signature: String,
  name: String,
  title: String,
  date: Date,
});

const aboveGroundTestSchema = new Schema(
  {
    propertyDetails: {
      propertyName: { type: String, required: true },
      date: { type: Date, default: Date.now },
      propertyAddress: String,
      isNewInstallation: Schema.Types.Mixed,
      isModification: Schema.Types.Mixed,
    },

    plansAndInstructions: {
      plans: {
        acceptedByAuthorities: [String],
        address: String,
        conformsToAcceptedPlans: Schema.Types.Mixed,
        equipmentIsApproved: Schema.Types.Mixed,
        deviationsExplanation: String,
      },
      instructions: {
        isPersonInChargeInstructed: Schema.Types.Mixed,
        instructionExplanation: String,
        hasSystemComponentsInstructions: Schema.Types.Mixed,
        hasCareAndMaintenanceInstructions: Schema.Types.Mixed,
        hasNFPA25: Schema.Types.Mixed,
      },
    },
    suppliesBuildingsNames: [String],

    systemComponents: {
      sprinklers: [sprinklerSchema],
      pipeAndFittings: {
        pipeType: String,
        fittingsType: String,
      },
    },

    alarmsAndValves: {
      alarmValvesOrFlowIndicators: [alarmDeviceSchema],
      dryPipeOperatingTests: [dryPipeOperatingTestSchema],
      delugeAndPreActionValves: [delugePreActionValveSchema],
      pressureReducingValveTests: [pressureReducingValveTestSchema],
    },

    testing: {
      backflowTest: {
        meansUsed: String, // For the "Indicate means used..." text field
        wasFlowDemandCreated: {
          type: String,
          enum: ["Yes", "No", "N/A"],
        }, // For the Yes/No/N/A checkbox
      },
      hydrostaticTest: {
        pressurePsi: Number,
        pressureBar: Number,
        durationHrs: Number,
      },
      isDryPipingPneumaticallyTested: Schema.Types.Mixed,
      doesEquipmentOperateProperly: Schema.Types.Mixed,
      improperOperationReason: String,
      noCorrosiveChemicalsCertification: Schema.Types.Mixed,
      drainTest: {
        gaugeReadingPsi: Number,
        gaugeReadingBar: Number,
        residualPressurePsi: Number,
        residualPressureBar: Number,
      },
      undergroundPiping: {
        isVerifiedByCertificate: Schema.Types.Mixed,
        wasFlushedByInstaller: Schema.Types.Mixed,
        explanation: String,
      },
      powderDrivenFasteners: {
        isTestingSatisfactory: Schema.Types.Mixed,
        explanation: String,
      },
      blankTestingGaskets: {
        numberUsed: Number,
        locations: String,
        numberRemoved: Number,
      },
    },

    weldingAndCutouts: {
      isWeldingPiping: Schema.Types.Mixed,
      certifications: {
        awsB21Compliant: Schema.Types.Mixed,
        weldersQualified: Schema.Types.Mixed,
        qualityControlProcedureCompliant: Schema.Types.Mixed,
      },
      cutouts: {
        hasRetrievalControl: Schema.Types.Mixed,
      },
    },

    finalChecks: {
      hasHydraulicDataNameplate: Schema.Types.Mixed,
      nameplateExplanation: String,
      areCapsAndStrapsRemoved: Schema.Types.Mixed,
    },

    remarksAndSignatures: {
      remarks: String,
      dateLeftInService: Date,
      sprinklerContractorName: String,
      fireMarshalOrAHJ: signatureSchema,
      sprinklerContractor: signatureSchema,
    },

    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticket: { type: String, required: false, default: "" },
  },
  { timestamps: true }
);

const AboveGroundTest = model("AboveGroundTest", aboveGroundTestSchema);

export default AboveGroundTest;
