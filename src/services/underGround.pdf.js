import fs from "fs/promises";
import path from "path";
import { generateSignedS3Url } from "../utils/s3.utils.js";

/**
 * Generates the HTML for the Underground Piping Certificate with the correct layout.
 *
 * @param {object} testData - The data object from your Mongoose schema.
 * @returns {Promise<string>} A promise that resolves with the complete HTML content.
 */
export const generateUndergroundTestHtml = async (testData = {}) => {
    let forPropertyOwnerSign = null;
    if (testData.signatures?.forPropertyOwner?.signed) {
        forPropertyOwnerSign = await generateSignedS3Url(
            testData.signatures?.forPropertyOwner?.signed
        );
    }
    let forInstallingContractorign = null;
    if (testData.signatures?.forInstallingContractor?.signed) {
        forInstallingContractorign = await generateSignedS3Url(
            testData.signatures?.forInstallingContractor?.signed
        );
    }
    // --- 1. Load Logo ---
    let logoDataUri = "";
    try {
        const logoPath = path.join(process.cwd(), "public", "logo.jpg");
        const logoFile = await fs.readFile(logoPath, "base64");
        logoDataUri = `data:mage/jpeg;base64,${logoFile}`;
    } catch (error) {
        console.warn("Logo file not found. Proceeding without logo.");
    }

    // --- 2. Define Helper Functions ---
    const val = (field) => field || ""; // Safely handles empty text fields
    const formatDate = (date) =>
        date ? new Date(date).toLocaleDateString() : ""; // Formats dates
    const chk = (boolValue) => (boolValue ? "checked" : ""); // Correctly handles checkboxes
    const radio = (enumValue, expectedValue) =>
        enumValue === expectedValue ? "checked" : "";
    // --- 3. HTML Template ---
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Contractor's Material and Test Certificate for Underground Piping</title>
        <style>
            /* --- General Page Setup --- */
            body { font-family: Arial, sans-serif; font-size: 9pt; color: #000; background-color: #ffffffff; }
            .page-container { background-color: #fff; width: 8.5in; min-height: 11in; margin: 20px auto; padding: 0.5in; }
            
            /* --- Header and Main Table --- */
            .header { text-align: center; margin-bottom: 20px; }
            .header img { width: 250px; height: auto; }
            .main-form-table { width: 100%; border-collapse: collapse; border: 2px solid #000; }
            .main-form-table td { border: 1px solid #000; padding: 8px; vertical-align: top; }
            
            /* --- Content Formatting --- */
            .main-title { font-size: 14pt; font-weight: bold; text-align: center; }
            .procedure-title { font-weight: bold; text-align: left; margin-bottom: 5px; }
            .procedure-text { font-size: 8pt; text-align: justify; line-height: 1.4; }
            .row-label-cell { width: 20%; font-weight: bold; text-align: center; vertical-align: middle; }
            .content-cell { text-align: left; }
            .field-row { display: flex; align-items: baseline; margin-bottom: 5px; }
            .field-row .label { padding-right: 8px; white-space: nowrap; }
            .field-row .line { flex-grow: 1;  min-height: 1.2em; }
            .checkbox-group { display: flex; gap: 15px; white-space: nowrap; }
            .checkbox-group label { display: flex; align-items: center; gap: 4px; }
            /* --- NEW, SIMPLIFIED CSS for the report-style layout --- */
            .content-cell {
                text-align: left;
                vertical-align: top;
            }
            .report-line {
                margin-bottom: 12px; /* Space between questions */
            }
            .report-line u {
                /* Styles the underlined data */
                padding: 0 4px;
            }
            .checkbox-result {
                /* Styles the Yes/No result to make it stand out */
                display: inline-block;
                border: 1px solid #000;
                padding: 1px 5px;
                margin-left: 15px;
                font-size: 8pt;
            }
                /* --- NEW CSS for the Flushing Tests section --- */
            .nested-columns {
                display: flex;
                width: 100%;
            }
            .nested-columns .column {
                flex: 1; /* Each column takes up equal space */
                padding-right: 15px;
            }
                /* --- NEW CSS for Page Breaks --- */
            .page-break {
                page-break-after: always; /* This forces a print page break after the element */
            }
            .page-header {
                text-align: center;
                font-size: 12pt;
                font-weight: bold;
                margin-bottom: 20px;
            }
            .vertical-group {
                display: flex;
                flex-direction: column; /* Stacks items vertically */
                align-items: flex-start; /* Aligns items to the left */
                margin-left: auto; /* Pushes the group to the far right */
            }
                /* --- NEW CSS for the Notes Box --- */
.notes-section {
    margin-top: 15px; /* Space above the notes box */
}
.notes-box {
    border: 1px solid #000;
    min-height: 120px; /* Gives the box a good default size */
    padding: 8px;
    white-space: pre-wrap; /* Ensures that line breaks in the data are respected */
}
        </style>
    </head>
    <body>
    <div class="page-container">
        <!-- HEADER (Logo Only) -->
        <header class="header">
            ${logoDataUri
            ? `<img src="${logoDataUri}" alt="Southern Fire Logo">`
            : "<h1>SOUTHERN FIRE</h1>"
        }
        </header>

        <!-- MAIN FORM TABLE -->
        <table class="main-form-table">
            <tbody>
                <!-- Row 1: Main Title -->
                <tr>
                    <td colspan="2">
                        <div class="main-title">Contractor's Material and Test Certificate for Underground Piping</div>
                    </td>
                </tr>

                <!-- Row 2: Procedure -->
                <tr>
                    <td colspan="2">
                        <div class="procedure-title">PROCEDURE</div>
                        <p class="procedure-text">
Upon completion of work, inspection and tests shall be made by the contractor’s representative and witnessed by an owner’s 
representative. All defects shall be corrected and system left in service before contractor’s personnel finally leave the job.
A certificate shall be filled out and signed by both representatives. Copies shall be prepared for approving authorities, owners, and 
contractor. It is understood the owner’s representative’s signature in no way prejudices any claim against contractor for faulty material, poor 
workmanship, or failure to comply with approving authority’s requirements or local ordinances.                        </p>
                    </td>
                </tr>

                <!-- Row 3: Property Name and Date -->
                <tr>
                    <td colspan="2">
                         <div class="field-row">
                            <span class="label">Property name</span>
                            <div class="line">${val(
            testData.propertyDetails?.propertyName
        )}</div>
                            <span class="label" style="margin-left: 20px;">Date</span>
                            <div class="line">${formatDate(
            testData.propertyDetails?.date
        )}</div>
                        </div>
                    </td>
                </tr>

                <!-- Row 4: Property Address -->
                <tr>
                    <td colspan="2">
                        <div class="field-row">
                            <span class="label">Property address</span>
                            <div class="line">${val(
            testData.propertyDetails?.propertyAddress
        )}</div>
                        </div>
                    </td>
                </tr>

                <!-- Row 5: Plans -->
                <tr>
                    <td class="row-label-cell">Plans</td>
                    <td class="content-cell">
                        <div class="field-row">
                            <span class="label">Accepted by approving authorities (names)</span>
                            <div class="line">${val(
            testData.plans?.acceptedByApprovingAuthorities.join(
                ", "
            )
        )}</div>
                        </div>
                        <div class="field-row">
                            <span class="label">Address</span>
                            <div class="line">${val(
            testData.plans?.address
        )}</div>
                        </div>
                        <div class="field-row" style="margin-top: 10px;">
                            <span class="label" style="flex-grow: 1;">Installation conforms to accepted plans</span>
                            <div class="checkbox-group">
                                <label><input type="checkbox" ${chk(
            testData.plans
                ?.installationConformsToAcceptedPlans
        )} > Yes</label>
                                <label><input type="checkbox" ${chk(
            !testData.plans
                ?.installationConformsToAcceptedPlans
        )} > No</label>
                            </div>
                        </div>
                        <div class="field-row">
                            <span class="label" style="flex-grow: 1;">Equipment used is approved</span>
                             <div class="checkbox-group">
                                <label><input type="checkbox" ${chk(
            testData.plans?.equipmentUsedIsApproved
        )} > Yes</label>
                                <label><input type="checkbox" ${chk(
            !testData.plans?.equipmentUsedIsApproved
        )} > No</label>
                            </div>
                        </div>
                        <div class="field-row">
                            <span class="label">If no, state deviations</span>
                            <div class="line">${val(
            testData.plans?.deviationsExplanation
        )}</div>
                        </div>
                    </td>
                </tr>
                <!-- ROW 6: Instructions -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Instructions
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell">
                        <!-- Question 1 -->
                        <div class="content-row">
                            <span class="label">Has person in charge of fire equipment been instructed as to location of control valves and care and maintenance of this new equipment?</span>
                            <div class="checkbox-group">
                                <label><input type="checkbox" ${chk(
            testData.instructions
                ?.personInChargeInstructed
        )} > Yes</label>
                                <label><input type="checkbox" ${chk(
            !testData.instructions
                ?.personInChargeInstructed
        )} > No</label>
                            </div>
                        </div>
                        <div class="content-row">
                            <span class="label">If no, explain</span>
                            <div class="line">${val(
            testData.instructions?.instructionExplanation
        )}</div>
                        </div>

                        <!-- Question 2 -->
                        <div class="content-row" style="margin-top: 15px;">
                            <span class="label">Have copies of appropriate instructions and care and maintenance charts been left on premises?</span>
                            <div class="checkbox-group">
                                <label><input type="checkbox" ${chk(
            testData.instructions
                ?.instructionsAndCareChartsLeft
        )} > Yes</label>
                                <label><input type="checkbox" ${chk(
            !testData.instructions
                ?.instructionsAndCareChartsLeft
        )} > No</label>
                            </div>
                        </div>
                        <div class="content-row">
                            <span class="label">If no, explain</span>
                            <div class="line">${val(
            testData.instructions?.chartsExplanation
        )}</div>
                        </div>
                    </td>
                </tr>
                <!-- ROW 7: Location -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Location
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell">
                        <div class="field-row">
                            <div class="line">${val(
            testData.suppliesBuildingsNames?.join(", ")
        )}</div>
                        </div>
                    </td>
                </tr>
                <!-- ROW 8: Underground pipes and joints -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Underground pipes and joints
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell">
                        <!-- Top fields -->
                        <div class="field-row">
                            <span class="label">Pipe types and class</span>
                            <div class="line" style="flex-grow: 2;">${val(
            testData.undergroundPipesAndJoints
                ?.pipeTypesAndClass
        )}</div>
                            <span class="label" style="margin-left: 20px;">Type joint</span>
                            <div class="line">${val(
            testData.undergroundPipesAndJoints?.typeJoint
        )}</div>
                        </div>

                        <hr style="border: none; border-top: 1px solid #000; margin: 15px 0;">

                        <!-- Middle questions -->
                        <div class="field-row">
                            <span class="label">Pipe conforms to</span>
                            <div class="line" style="width: 80px; flex-grow: 0;">${val(
            testData.undergroundPipesAndJoints?.pipeStandard
        )}</div>
                            <span class="label" style="flex-grow: 1;">standard</span>
                            <div class="checkbox-group">
                                <label><input type="checkbox" ${chk(
            testData.undergroundPipesAndJoints
                ?.pipeStandardConform
        )} > Yes</label>
                                <label><input type="checkbox" ${chk(
            !testData.undergroundPipesAndJoints
                ?.pipeStandardConform
        )} > No</label>
                            </div>
                        </div>
                        <div class="field-row">
                            <span class="label">Fittings conform to</span>
                            <div class="line" style="width: 80px; flex-grow: 0;">${val(
            testData.undergroundPipesAndJoints
                ?.fittingStandard
        )}</div>
                            <span class="label" style="flex-grow: 1;">standard</span>
                            <div class="checkbox-group">
                                <label><input type="checkbox" ${chk(
            testData.undergroundPipesAndJoints
                ?.fittingStandardConform
        )} > Yes</label>
                                <label><input type="checkbox" ${chk(
            !testData.undergroundPipesAndJoints
                ?.fittingStandardConform
        )} > No</label>
                            </div>
                        </div>
                        <div class="field-row">
                            <span class="label">If no, explain</span>
                            <div class="line">${val(
            testData.undergroundPipesAndJoints
                ?.fittingStandardExplanation
        )}</div>
                        </div>

                        <hr style="border: none; border-top: 1px solid #000; margin: 15px 0;">

                        <!-- Bottom question -->
                        <div class="field-row">
                            <span class="label" style="flex-grow: 1;">Joints needing anchorage clamped, strapped, or blocked in accordance with <br>
                                <div class="line" style="width: 80px; display: inline-block;">${val(
            testData.undergroundPipesAndJoints
                ?.jointsStandard
        )}</div> standard
                            </span>
                            <div class="checkbox-group">
                                <label><input type="checkbox" ${chk(
            testData.undergroundPipesAndJoints
                ?.jointsStandardConform
        )} > Yes</label>
                                <label><input type="checkbox" ${chk(
            !testData.undergroundPipesAndJoints
                ?.jointsStandardConform
        )} > No</label>
                            </div>
                        </div>
                        <div class="field-row">
                            <span class="label">If no, explain</span>
                            <div class="line">${val(
            testData.undergroundPipesAndJoints
                ?.jointsStandardExplanation
        )}</div>
                        </div>
                    </td>
                </tr>
                <!-- ROW 9: Test description -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Test description
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell">
                        <div class="test-description-content">
                            <p>
                                <b>Flushing:</b> Flow the required rate until water is clear as indicated by no collection of foreign material in burlap bags at outlets such as hydrants and blow-offs. Flush in accordance with the requirements of 6.10.2.1.3.
                            </p>
                            <p>
                                <b>Hydrostatic:</b> All piping and attached appurtenances subjected to system working pressure shall be hydrostatically tested at 200 psi (13.8 bar) or 50 psi (3.4 bar) in excess of the system working pressure, whichever is greater, and shall maintain that pressure ±5 psi (0.34 bar) for 2 hours.
                            </p>
                            <p>
                                <b>Hydrostatic Testing Allowance:</b> Where additional water is added to the system to maintain the test pressures required by 6.10.2.2.1, the amount of water shall be measured and shall not exceed the limits of the following equation (for metric equation, see 6.10.2.2.6):
                            </p>

                            <div class="equation-container">
                                <div class="equation">
                                    L = 
                                    <span>
                                        <div class="numerator">SD√P</div>
                                        <div>148,000</div>
                                    </span>
                                </div>
                                <div class="equation-defs">
                                    L = testing allowance (makeup water), in gallons per hour<br>
                                    S = length of pipe tested, in feet<br>
                                    D = nominal diameter of the pipe, in inches<br>
                                    P = average test pressure during the hydrostatic test, in pounds per square inch (gauge)
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
                  </tbody>
        </table> <!-- <-- ADD THIS to close the first table -->

        <div class="footer-text"><div></div><div>NFPA 13 (p. 1 of 2)</div></div>
                <div class="page-break"></div>
                <div class="page-header">Contractor's Material and Test Certificate for Underground Piping (continued)</div>
   <table class="main-form-table"> <!-- <-- ADD THIS to start the second table -->
            <tbody>
              <!-- ROW 10: Flushing tests (Corrected) -->
<!-- ROW 10: Flushing tests (Corrected for flexible line width) -->
<tr>
    <!-- Left Label Cell -->
    <td class="row-label-cell">
        Flushing tests
    </td>

    <!-- Right Content Cell -->
    <td class="content-cell">
        <!-- Section 1: New underground piping -->
        <div class="field-row">
            <div class="field-group-container">
                <span class="label">New underground piping flushed according to</span>
                <!-- REMOVED style attribute from this div -->
                <div class="line">${val(
            testData.flushingTests?.undergroundPipingStandard
        )}</div>
                <span class="label">standard by (company)</span>
            </div>
            <div class="checkbox-group">
                <label><input type="checkbox" ${chk(
            testData.flushingTests?.undergroundPipingStandardConform
        )} > Yes</label>
                <label><input type="checkbox" ${chk(
            !testData.flushingTests?.undergroundPipingStandardConform
        )} > No</label>
            </div>
        </div>
        <div class="field-row">
            <span class="label">If no, explain</span>
            <div class="line">${val(
            testData.flushingTests?.undergroundPipingStandardExplanation
        )}</div>
        </div>

        <hr style="border: none; border-top: 1px solid #000; margin: 15px 0;">

        <!-- Checkbox Sections -->
        <div class="nested-columns" style="margin-top: 10px;">
            <div class="column">
                <strong>How flushing flow was obtained</strong>
                <div><label><input type="radio" name="flushing_flow_group" ${chk(
            testData.flushingTests?.flushingFlowObtained ===
            "Public water"
        )} > Public water</label></div>
                <div><label><input type="radio" name="flushing_flow_group" ${chk(
            testData.flushingTests?.flushingFlowObtained ===
            "Tank or reservoir"
        )} > Tank or reservoir</label></div>
                <div><label><input type="radio" name="flushing_flow_group" ${chk(
            testData.flushingTests?.flushingFlowObtained === "Fire pump"
        )} > Fire pump</label></div>
            </div>
            <div class="column">
                <strong>Through what type opening</strong>
                <div><label><input type="radio" name="opening_type_group" ${chk(
            testData.flushingTests?.openingType === "Hydrant butt"
        )} > Hydrant butt</label></div>
                <div><label><input type="radio" name="opening_type_group" ${chk(
            testData.flushingTests?.openingType === "Open pipe"
        )} > Open pipe</label></div>
            </div>
        </div>

        <hr style="border: none; border-top: 1px solid #000; margin: 15px 0;">
        
        <!-- Section 2: Lead-ins flushed -->
        <div class="field-row">
            <div class="field-group-container">
                <span class="label">Lead-ins flushed according to</span>
                <!-- REMOVED style attribute from this div -->
                <div class="line">${val(
            testData.leadsflushingTests?.undergroundPipingStandard
        )}</div>
                <span class="label">standard by (company)</span>
            </div>
            <div class="checkbox-group">
                <label><input type="checkbox" ${chk(
            testData.leadsflushingTests?.undergroundPipingStandardConform
        )} > Yes</label>
                <label><input type="checkbox" ${chk(
            !testData.leadsflushingTests?.undergroundPipingStandardConform
        )} > No</label>
            </div>
        </div>
        <div class="field-row">
            <span class="label">If no, explain</span>
            <div class="line">${val(
            testData.leadsflushingTests?.undergroundPipingStandardExplanation
        )}</div>
        </div>
        <div class="nested-columns" style="margin-top: 10px;">
             <div class="column">
                <strong>How flushing flow was obtained</strong>
                <div><label><input type="radio" name="lead_in_flow_group" ${chk(
            testData.leadsflushingTests?.flushingFlowObtained ===
            "Public water"
        )} > Public water</label></div>
                <div><label><input type="radio" name="lead_in_flow_group" ${chk(
            testData.leadsflushingTests?.flushingFlowObtained ===
            "Tank or reservoir"
        )} > Tank or reservoir</label></div>
                <div><label><input type="radio" name="lead_in_flow_group" ${chk(
            testData.leadsflushingTests?.flushingFlowObtained ===
            "Fire pump"
        )} > Fire pump</label></div>
            </div>
            <div class="column">
                <strong>Through what type opening</strong>
                <div><label><input type="radio" name="lead_in_opening_group" ${chk(
            testData.leadsflushingTests?.openingType ===
            "Y connection to flange and spigot"
        )} > Y connection to flange and spigot</label></div>
                <div><label><input type="radio" name="lead_in_opening_group" ${chk(
            testData.leadsflushingTests?.openingType === "Open pipe"
        )} > Open pipe</label></div>
            </div>
        </div>
    </td>
</tr>
<!-- ROW 11: Hydrostatic test -->
<tr>
    <!-- Left Label Cell -->
    <td class="row-label-cell">
        Hydrostatic test
    </td>

    <!-- Right Content Cell -->
    <td class="content-cell">
        <div class="field-row">
            <span class="label">All new underground piping hydrostatically tested at</span>
            <div class="line" style="width: 80px; flex-grow: 0;">${val(
            testData.hydrostaticTest?.testedAtPSI
        )}</div>
            <span class="label">psi for</span>
            <div class="line" style="width: 80px; flex-grow: 0;">${val(
            testData.hydrostaticTest?.testedHours
        )}</div>
            <span class="label">hours</span>
            
            <div class="vertical-group">
                <span>Joints covered</span>
                <div class="checkbox-group">
                    <label><input type="checkbox" ${chk(
            testData.hydrostaticTest?.jointsCovered
        )} > Yes</label>
                    <label><input type="checkbox" ${chk(
            !testData.hydrostaticTest?.jointsCovered
        )} > No</label>
                </div>
            </div>
        </div>
    </td>
</tr>

<!-- ROW 12: Leakage test -->
<tr>
    <!-- Left Label Cell -->
    <td class="row-label-cell">
        Leakage test
    </td>

    <!-- Right Content Cell -->
    <td class="content-cell">
        <div>
            <strong>Total amount of leakage measured</strong>
            <div class="field-row" style="margin-top: 5px;">
                <div class="line">${val(
            testData.leakageTest?.leakeageGallons
        )}</div>
                <span class="label">gallons</span>
                <div class="line">${val(
            testData.leakageTest?.leakageHours
        )}</div>
                <span class="label">hours</span>
            </div>
        </div>
        <div style="margin-top: 10px;">
            <strong>Allowable leakage</strong>
            <div class="field-row" style="margin-top: 5px;">
                <div class="line">${val(
            testData.leakageTest?.allowableLeakageGallons
        )}</div>
                <span class="label">gallons</span>
                <div class="line">${val(
            testData.leakageTest?.allowableLeakageHours
        )}</div>
                <span class="label">hours</span>
            </div>
        </div>
    </td>
</tr>
<!-- ROW 13: Forward flow test of backflow preventer -->
<tr>
    <!-- Left Label Cell -->
    <td class="row-label-cell">
        Forward flow test of backflow preventer
    </td>

    <!-- Right Content Cell -->
    <td class="content-cell">
        <div class="field-row">
            <span class="label" style="flex-grow: 1;">Forward flow test performed in accordance with 6.10.2.5.2:</span>
            <div class="checkbox-group">
                <label><input type="checkbox" ${chk(
            testData.leakageTest?.forwardFlowTestPerformed
        )} > Yes</label>
                <label><input type="checkbox" ${chk(
            !testData.leakageTest?.forwardFlowTestPerformed
        )} > No</label>
            </div>
        </div>
    </td>
</tr>

<!-- ROW 14: Hydrants -->
<tr>
    <!-- Left Label Cell -->
    <td class="row-label-cell">
        Hydrants
    </td>

    <!-- Right Content Cell -->
    <td class="content-cell">
        <div class="field-row">
            <div class="field-row" style="flex-grow:1;">
                <span class="label">Number installed</span>
                <div class="line">${val(
            testData.hydrantsAndControlValves?.numberOfHydrants
        )}</div>
            </div>
            <div class="field-row" style="flex-grow:2; margin-left: 20px;">
                <span class="label">Type and make</span>
                <div class="line">${val(
            testData.hydrantsAndControlValves?.hydrantMakeAndType
        )}</div>
            </div>
            
            <div class="vertical-group">
                <span>All operate satisfactorily</span>
                <div class="checkbox-group">
                    <label><input type="checkbox" ${chk(
            testData.hydrantsAndControlValves
                ?.allOperateSatisfactorily
        )} > Yes</label>
                    <label><input type="checkbox" ${chk(
            !testData.hydrantsAndControlValves
                ?.allOperateSatisfactorily
        )} > No</label>
                </div>
            </div>
        </div>
    </td>
</tr>
<!-- ROW 15: Control valves -->
<tr>
    <!-- Left Label Cell -->
    <td class="row-label-cell">
        Control valves
    </td>

    <!-- Right Content Cell -->
    <td class="content-cell">
        <!-- Question 1 -->
        <div class="field-row">
            <span class="label" style="flex-grow: 1;">Water control valves left wide open</span>
            <div class="checkbox-group">
                <label><input type="checkbox" ${chk(
            testData.hydrantsAndControlValves
                ?.waterControlValesLeftWideOpen
        )} > Yes</label>
                <label><input type="checkbox" ${chk(
            !testData.hydrantsAndControlValves
                ?.waterControlValesLeftWideOpen
        )} > No</label>
            </div>
        </div>
        <div class="field-row">
            <span class="label">If no, state reason</span>
            <div class="line">${val(
            testData.hydrantsAndControlValves?.valvesNotOpenExplanation
        )}</div>
        </div>

        <!-- Question 2 -->
        <div class="field-row" style="margin-top: 15px;">
            <span class="label" style="flex-grow: 1;">Hose threads of fire department connections and hydrants interchangeable with those of fire department answering alarm</span>
            <div class="checkbox-group">
                <label><input type="checkbox" ${chk(
            testData.hydrantsAndControlValves?.hoseThreadsInterchangeable
        )} > Yes</label>
                <label><input type="checkbox" ${chk(
            !testData.hydrantsAndControlValves?.hoseThreadsInterchangeable
        )} > No</label>
            </div>
        </div>
    </td>
</tr>
<!-- ROW 16: Remarks -->
<tr>
    <!-- Left Label Cell -->
    <td class="row-label-cell">
        Remarks
    </td>
    <!-- Right Content Cell -->
    <td class="content-cell">
        <div class="field-row">
            <span class="label">Date left in service</span>
            <div class="line">${formatDate(
            testData.remarks?.dateLeftInService
        )}</div>
        </div>
        <div class="field-row" style="margin-top: 10px;">
            <span class="label">Name of installing contractor</span>
            <div class="line">${val(
            testData.remarks?.nameOfInstallingContractor
        )}</div>
        </div>
    </td>
</tr>

<!-- ROW 17: Signatures -->
<tr>
    <!-- Left Label Cell -->
    <td class="row-label-cell">
        Signatures
    </td>

    <!-- Right Content Cell -->
    <td class="content-cell">
        <div class="signatures-title">Tests witnessed by</div>
        
        <!-- Property Owner Signature Block -->
        <div class="field-row" style="margin-top: 15px; align-items: flex-end;">
            <div style="flex-grow: 2;">
<div class="line" style="min-height: 60px; text-align: center;">
                    ${forPropertyOwnerSign
            ? `<img src="${forPropertyOwnerSign}" style="height: 60px; width: auto; object-fit: contain;">`
            : ""
        }
                </div>
                <div style="border-top: 1px solid #000; padding-top: 2px; font-size: 8pt;">For property owner (signed)</div>
            </div>
            <div style="flex-grow: 1; margin-left: 20px;">
                <div class="line" style=" padding-bottom: 2px;">
                    <span style="font-size: 8pt; padding-right: 15px; font-style: normal;">Title</span>
                    <span class="data-value" style="text-decoration: none;">${val(
            testData.signatures?.forPropertyOwner?.title
        )}</span>
                </div>
            </div>
            <div style="width: 1.5in; margin-left: 20px;">
                <div class="line" style=" padding-bottom: 2px;">
                    <span style="font-size: 8pt; padding-right: 15px; font-style: normal;">Date</span>
                    <span class="data-value" style="text-decoration: none;">${formatDate(
            testData.signatures?.forPropertyOwner?.date
        )}</span>
                </div>
            </div>
        </div>

        <!-- Installing Contractor Signature Block -->
        <div class="field-row" style="margin-top: 25px; align-items: flex-end;">
            <div style="flex-grow: 2;">
<div class="line" style="min-height: 60px; text-align: center;">
                    ${forInstallingContractorign
            ? `<img src="${forInstallingContractorign}" style="height: 60px; width: auto; object-fit: contain;">`
            : ""
        }
                </div>
                <div style="border-top: 1px solid #000; padding-top: 2px; font-size: 8pt;">For installing contractor (signed)</div>
            </div>
            <div style="flex-grow: 1; margin-left: 20px;">
                <div class="line" style=" padding-bottom: 2px;">
                    <span style="font-size: 8pt; padding-right: 15px; font-style: normal;">Title</span>
                    <span class="data-value" style="text-decoration: none;">${val(
            testData.signatures?.forInstallingContractor?.title
        )}</span>
                </div>
            </div>
            <div style="width: 1.5in; margin-left: 20px;">
                <div class="line" style=" padding-bottom: 2px;">
                    <span style="font-size: 8pt; padding-right: 15px; font-style: normal;">Date</span>
                    <span class="data-value" style="text-decoration: none;">${formatDate(
            testData.signatures?.forInstallingContractor?.date
        )}</span>
                </div>
            </div>
        </div>
    </td>
</tr>
  </tbody>
        </table>
        <div class="page-header" style="page-break-before: always;">Additional Explanation and Notes</div>

                <table class="main-form-table">
            <tbody>
                <!-- ROW 18: Additional Notes -->
                <tr>
                    <td colspan="2" class="content-cell">
                        <div class="notes-box" style="min-height: 4.5in;">
                             ${val(testData.additionalNotes)}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    </body>
    </html>
  `;
};
