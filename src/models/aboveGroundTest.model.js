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
  waterPressureWithoutQOD: Number, // psi
  waterPressureWithQOD: Number, // psi
  airPressureWithoutQOD: Number, // psi
  airPressureWithQOD: Number, // psi
  tripPointAirPressureWithoutQOD: Number, // psi
  tripPointAirPressureWithQOD: Number, // psi
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
        enum: ['pneumatic', 'electric', 'hydraulic']
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
    }
});

const pressureReducingValveTestSchema = new Schema({
    locationAndFloor: String,
    makeAndModel: String,
    setting: String,
    staticPressure: {
        inlet: Number, // psi
        outlet: Number, // psi
    },
    residualPressure: {
        inlet: Number, // psi
        outlet: Number, // psi
    },
    flowRate: Number, // gpm
});

const signatureSchema = new Schema({
    signature: String, // Can store image URL or digital signature data
    name: String,
    title: String,
    date: Date,
});


const aboveGroundTestSchema = new Schema(
  {
    // Section 1: Property Details
    propertyDetails: {
      propertyName: { type: String, required: true },
      date: { type: Date, default: Date.now },
      propertyAddress: String,
      isNewInstallation: Boolean,
      isModification: Boolean,
    },

    // Section 2: Plans & Instructions
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

    // Section 3: System Location & Components
    systemComponents: {
      sprinklers: [sprinklerSchema],
      pipeAndFittings: {
        pipeType: String,
        fittingsType: String,
      },
    },

    // Section 4: Alarm Devices & Valves
    alarmsAndValves: {
      alarmValvesOrFlowIndicators: [alarmDeviceSchema],
      dryPipeOperatingTests: [dryPipeOperatingTestSchema],
      delugeAndPreActionValves: [delugePreActionValveSchema],
      pressureReducingValveTests: [pressureReducingValveTestSchema],
    },
    
    // Section 5: Testing
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

    // Section 6: Welding, Cutouts & Nameplate
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

    // Section 7: Final Checks
    finalChecks: {
        hasHydraulicDataNameplate: Boolean,
        nameplateExplanation: String,
        areCapsAndStrapsRemoved: Boolean,
    },
    
    // Section 8: Remarks & Signatures
    remarksAndSignatures: {
      remarks: String,
      dateLeftInService: Date,
      sprinklerContractorName: String,
      fireMarshalOrAHJ: signatureSchema,
      sprinklerContractor: signatureSchema,
    },

    // Section 9: Additional Notes
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
    }
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const AboveGroundTest = model("AboveGroundTest", aboveGroundTestSchema);

export default AboveGroundTest;