import mongoose from "mongoose";



const aboveGroundTestSchema = new mongoose.Schema(
{
  
  // Property Details
  Property Name
  Date
  Property Address
  New installation? (yes no)
  Modification? If yes, complete applicable portions of the form. (yes no)

  // Plans & Instructions
  // Plans
  Accepted by approving authorities (names)
  Address
  Installation conforms to accepted plans:
  Equipment used is approved. If no, explain deviations
  explain
  Has person in charge of fire equipment been instructed as to location of control valves and care and maintenance of this new equipment? If no, explain.
explain
// Have copies of the following been left on the premises?
System components instructions (yes no)
Care and maintenance instructions (yes no)
NFPA 25 (yes no)

// Location of  System
// Sprinklers
array of [
  Make
  Model
  Year of Mgf.
  Orifice size
  Quantity
  Temp. rating
]

Pipe and Fittings
Type of Pipe
Type of Fittings


// Alarm device & Dry valve
// Alarm valve or flow indicator
array of [
  Type
  Make
  Model
  // Maximum time to operate 
  Maximum time (min)
  Maximum time (sec)
]


},
  { timestamps: true }
);

const AboveGroundTest = mongoose.model("AboveGroundTest", aboveGroundTestSchema);

export default AboveGroundTest;