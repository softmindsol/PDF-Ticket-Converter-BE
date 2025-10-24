import mongoose from "mongoose";

const UnderGroundTestSchema = new mongoose.Schema(
  {
    propertyDetails: {
      propertyName: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      propertyAddress: {
        type: String,
        required: true,
      },
    },

    plans: {
      acceptedByApprovingAuthorities: [String],
      address: String,
      installationConformsToAcceptedPlans: {
        type: Boolean,
        default: false,
      },
      equipmentUsedIsApproved: {
        type: Boolean,
        default: false,
      },
      deviationsExplanation: String,
    },

    instructions: {
      personInChargeInstructed: {
        type: Boolean,
        default: false,
      },
      instructionExplanation: String,
      instructionsAndCareChartsLeft: {
        type: Boolean,
        default: false,
      },
      chartsExplanation: String,
    },

    suppliesBuildingsNames: [String],

    undergroundPipesAndJoints: {
      pipeTypesAndClass: String,
      typeJoint: String,
      pipeStandard: String,
      pipeStandardConform: {
        type: Boolean,
        default: false,
      },
      fittingStandard: String,
      fittingStandardConform: {
        type: Boolean,
        default: false,
      },
      fittingStandardExplanation: String,
      jointsStandard: String,
      jointsStandardConform: {
        type: Boolean,
        default: false,
      },
      jointsStandardExplanation: String,
    },

    flushingTests: {
      undergroundPipingStandard: String,
      undergroundPipingStandardConform: {
        type: Boolean,
        default: false,
      },
      undergroundPipingStandardExplanation: String,
      flushingFlowObtained: {
        type: String,
        enum: ["Public water", "Tank or reservoir", "Fire pump"],
      },
      openingType: {
        type: String,
        enum: ["Hydrant butt", "Open pipe"],
      },
    },
    leadsflushingTests: {
      undergroundPipingStandard: String,
      undergroundPipingStandardConform: {
        type: Boolean,
        default: false,
      },
      undergroundPipingStandardExplanation: String,
      flushingFlowObtained: {
        type: String,
        enum: ["Public water", "Tank or reservoir", "Fire pump"],
      },
      openingType: {
        type: String,
        enum: ["Y connection to flange and spigot", "Open pipe"],
      },
    },

    hydrostaticTest: {
      testedAtPSI: Number,
      testedHours: Number,
      jointsCovered: {
        type: Boolean,
        default: false,
      },
    },

    leakageTest: {
      leakeageGallons: Number,
      leakageHours: Number,
      allowableLeakageGallons: Number,
      allowableLeakageHours: Number,
      forwardFlowTestPerformed: {
        type: Boolean,
        default: false,
      },
    },

    hydrantsAndControlValves: {
      numberOfHydrants: Number,
      hydrantMakeAndType: String,
      allOperateSatisfactorily: {
        type: Boolean,
        default: false,
      },
      waterControlValvesLeftWideOpen: {
        type: Boolean,
        default: false,
      },
      valvesNotOpenExplanation: String,
      hoseThreadsInterchangeable: {
        type: Boolean,
        default: false,
      },
    },

    remarks: {
      dateLeftInService: Date,
      nameOfInstallingContractor: String,
    },

    signatures: {
      forPropertyOwner: {
        signed: String,
        title: String,
        date: Date,
      },
      forInstallingContractor: {
        signed: String,
        title: String,
        date: Date,
      },
    },

    additionalNotes: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    ticket: { type: String, required: false, default: "" },

  },
  {
    timestamps: true,
  }
);

const UnderGroundTest = mongoose.model(
  "UnderGroundTest",
  UnderGroundTestSchema
);

export default UnderGroundTest;
