import mongoose from "mongoose";

const UnderGroundTestSchema = new mongoose.Schema({
    // Property Details
    propertyDetails: {
        propertyName: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        propertyAddress: {
            type: String,
            required: true
        }
    },

    // Plans
    plans: {
        acceptedByApprovingAuthorities: [String],
        address: String,
        installationConformsToAcceptedPlans: {
            type: Boolean,
            default: false
        },
        equipmentUsedIsApproved: {
            type: Boolean,
            default: false
        },
        deviationsExplanation: String
    },

    // Instructions
    instructions: {
        personInChargeInstructed: {
            type: Boolean,
            default: false
        },
        instructionExplanation: String,
        instructionsAndCareChartsLeft: {
            type: Boolean,
            default: false
        },
        chartsExplanation: String
    },

    suppliesBuildingsNames: [String],

    // Underground Pipes and Joints
    undergroundPipesAndJoints: {
        pipeTypesAndClass: String,
        typeJoint: String,
        pipeStandard: String,
        pipeStandardConform: {
            type: Boolean,
            default: false
        },
        fittingStandard: String,
        fittingStandardConform: {
            type: Boolean,
            default: false
        },
        fittingStandardExplanation: String,
        jointsStandard: String,
        jointsStandardConform: {
            type: Boolean,
            default: false
        },
        jointsStandardExplanation: String
    },

    // Flushing Tests
    flushingTests: {
        undergroundPipingStandard: String,
        undergroundPipingStandardConform: {
            type: Boolean,
            default: false
        },
        undergroundPipingStandardExplanation: String,
        flushingFlowObtained: {
            type: String,
            enum: ['Public water', 'Tank or reservoir', 'Fire pump']
        },
        openingType: {
            type: String,
            enum: ['Y connection to flange and spigot', 'Open pipe']
        }
    },

    // Hydrostatic Test
    hydrostaticTest: {
        testedAtPSI: Number,
        testedHours: Number,
        jointsCovered: {
            type: Boolean,
            default: false
        }
    },

    // Leakage Test
    leakageTest: {
        leakeageGallons: Number,
        leakageHours: Number,
        allowableLeakageGallons: Number,
        allowableLeakageHours: Number,
        forwardFlowTestPerformed: {
            type: Boolean,
            default: false
        }
    },

    // Hydrants & Control Valves
    hydrantsAndControlValves: {
        numberOfHydrants: Number,
        hydrantMakeAndType: String,
        allOperateSatisfactorily: {
            type: Boolean,
            default: false
        },
        waterControlValvesLeftWideOpen: {
            type: Boolean,
            default: false
        },
        valvesNotOpenExplanation: String,
        hoseThreadsInterchangeable: {
            type: Boolean,
            default: false
        }
    },

    // Remarks
    remarks: {
        dateLeftInService: Date,
        nameOfInstallingContractor: String
    },

    // Signatures (Tests witnessed by)
    signatures: {
        forPropertyOwner: {
            signed: String, // Can store a name or a path to a digital signature
            title: String,
            date: Date
        },
        forInstallingContractor: {
            signed: String,
            title: String,
            date: Date
        }
    },

    additionalNotes: String,

        createdBy: {
        type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const UnderGroundTest = mongoose.model("UnderGroundTest", UnderGroundTestSchema);

export default UnderGroundTest;