import { boolean } from "joi";
import mongoose from "mongoose";
const UnderGroundTestSchema = new mongoose.Schema({
    // Property Details
    Property Name
    Date
    Property Address
    // Plans 
    Accepted by approving authorities (names)
    Address
    Installation conforms to accepted plans: (yes ,no)
    Equipment used is approved. If no, explain deviations:  (yes, no)
    explain
    // Instructions
    Has person in charge of fire equipment been 
instructed as to location of control valves and 
care and maintenance of this new equipment? If
no, explain. (yes no)
explain
Have copies of appropriate instructions and care 
and maintenance charts been left on premises?
If no, explain.  (yes no)
 explain


 Supplies buildings names
//  Underground Pipes and Joints
Pipe types and class
Type joint

pipestandard
 pipestandardConform (yes no)
 fittingstandard 
fittingstandardconform (yes no )
explain
 jointsstandard 
 jointsstandardconform (yes no )
 explain
 


},
{

})

const ServiceTicket = mongoose.model("UnderGroundTest", UnderGroundTestSchema);

export default ServiceTicket