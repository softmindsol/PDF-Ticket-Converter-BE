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
  alarmOperatedProperlyWithoutQOD: Boolean,
  alarmOperatedProperlyWithQOD: Boolean,
});

const delugePreActionValveSchema = new Schema({
  operation: {
    type: String,
    enum: ["pneumatic", "electric", "hydraulic"],
  },
  isPipingSupervised: Boolean,
  isDetectingMediaSupervised: Boolean,
  operatesFromManualOrRemote: Boolean,
  isAccessibleForTesting: Boolean,
  explanation: String,
  make: String,
  model: String,
  doesSupervisionLossAlarmOperate: Boolean,
  doesValveReleaseOperate: Boolean,
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
      isNewInstallation: Boolean,
      isModification: Boolean,
    },

    plansAndInstructions: {
      plans: {
        acceptedByAuthorities: [String],
        address: String,
        conformsToAcceptedPlans: Boolean,
        equipmentIsApproved: Boolean,
        deviationsExplanation: String,
      },
      instructions: {
        isPersonInChargeInstructed: Boolean,
        instructionExplanation: String,
        hasSystemComponentsInstructions: Boolean,
        hasCareAndMaintenanceInstructions: Boolean,
        hasNFPA25: Boolean,
      },
    },

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
      hydrostaticTest: {
        pressurePsi: Number,
        pressureBar: Number,
        durationHrs: Number,
      },
      isDryPipingPneumaticallyTested: Boolean,
      doesEquipmentOperateProperly: Boolean,
      improperOperationReason: String,
      noCorrosiveChemicalsCertification: Boolean,
      drainTest: {
        gaugeReadingPsi: Number,
        gaugeReadingBar: Number,
        residualPressurePsi: Number,
        residualPressureBar: Number,
      },
      undergroundPiping: {
        isVerifiedByCertificate: Boolean,
        wasFlushedByInstaller: Boolean,
        explanation: String,
      },
      powderDrivenFasteners: {
        isTestingSatisfactory: Boolean,
        explanation: String,
      },
      blankTestingGaskets: {
        numberUsed: Number,
        locations: String,
        numberRemoved: Number,
      },
    },

    weldingAndCutouts: {
      isWeldingPiping: Boolean,
      certifications: {
        awsB21Compliant: Boolean,
        weldersQualified: Boolean,
        qualityControlProcedureCompliant: Boolean,
      },
      cutouts: {
        hasRetrievalControl: Boolean,
      },
    },

    finalChecks: {
      hasHydraulicDataNameplate: Boolean,
      nameplateExplanation: String,
      areCapsAndStrapsRemoved: Boolean,
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
  },
  { timestamps: true }
);

const AboveGroundTest = model("AboveGroundTest", aboveGroundTestSchema);

export default AboveGroundTest;
