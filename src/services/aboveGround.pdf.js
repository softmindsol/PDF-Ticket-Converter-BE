import fs from "fs/promises";
import path from "path";
import { generateSignedS3Url } from "../utils/s3.utils.js";

export const generateAbovegroundTestHtml = async (testData = {}) => {
      let sprinklerContractorSign=null
  if (testData.remarksAndSignatures?.sprinklerContractor?.signature) {
    sprinklerContractorSign = await generateSignedS3Url(
      testData.remarksAndSignatures?.sprinklerContractor?.signature
    );
  }
        let fireMarshalOrAHJSign=null
  if (testData.remarksAndSignatures?.fireMarshalOrAHJ?.signature) {
    fireMarshalOrAHJSign = await generateSignedS3Url(
      testData.remarksAndSignatures?.fireMarshalOrAHJ?.signature
    );
  }
  let logoDataUri = "";
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.jpg");
    const logoFile = await fs.readFile(logoPath, "base64");
    logoDataUri = `data:mage/jpeg;base64,${logoFile}`;
  } catch (error) {
    console.warn("Logo file not found. Proceeding without logo.");
  }

  const val = (field) => field || "";
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "";
  const chk = (boolValue) => (boolValue ? "checked" : "");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Contractor's Material and Test Certificate for Aboveground Piping</title>
        <style>
            /* --- General Page Setup --- */
            body { font-family: Arial, sans-serif; font-size: 9pt; color: #000; background-color: #ffffffff; }
            .page-container { background-color: #fff; width: 8.5in; min-height: 11in; margin: 20px auto; padding: 0.5in; box-sizing: border-box; }
            
            /* --- Header and Main Table --- */
            .header { text-align: center; margin-bottom: 10px; }
            .header img { width: 300px; height: auto; }
            .main-form-table { width: 100%; border-collapse: collapse; border: 2px solid #000; }
            .main-form-table td { border: 1px solid #000; padding: 8px; vertical-align: top; }
            
            /* --- Content Formatting --- */
            .main-title { font-size: 14pt; font-weight: bold; text-align: center; }
            .procedure-title { font-weight: bold; text-align: left; margin-bottom: 5px; }
            .procedure-text { font-size: 8pt; text-align: justify; line-height: 1.4; }
            /* --- NEW & CORRECTED CSS for Report-Style Fields --- */
            .content-cell {
                text-align: left;
                vertical-align: top; /* Ensures content starts at the top of the cell */
                padding: 8px;
            }
            .field-label {
                font-size: 8pt;
                font-weight: bold;
                color: #555;
                margin-bottom: 2px; /* Small space between label and data */
            }
            .field-data {
                font-size: 10pt;
                /* The data will wrap automatically if it's long */
            }
            .field-container {
                text-align: left;
            }
            .field-container strong {
                font-weight: normal; /* Labels are not bold in the image */
                padding-right: 15px; /* Space between label and value */
            }
                /* --- NEW CSS for Question Rows with Checkboxes --- */
            .question-row {
                display: flex;
                justify-content: space-between; /* Pushes question and checkboxes apart */
                align-items: center;          /* Vertically centers the items */
                margin-bottom: 5px;           /* Adds space between the question lines */
            }
            .checkbox-group {
                display: flex;
                gap: 15px;      /* Space between Yes and No */
                flex-shrink: 0; /* Prevents checkboxes from shrinking or wrapping */
            }
            .checkbox-group label {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            .info-text {
                margin-top: 5px;
            }
                /* --- NEW CSS for Labeled Rows --- */
            .row-label-cell {
                width: 20%; /* Sets the width of the left label column */
                font-weight: bold;
                text-align: center;
                vertical-align: middle; /* Centers the label text */
            }
            .content-cell .field-row {
                display: flex;
                align-items: center;
                margin-bottom: 5px;
            }
            .content-cell .field-row .label {
                padding-right: 15px;
            }
            .content-cell .field-row .line-value {
                flex-grow: 1; /* Makes the value take up all space */
            }
                /* --- NEW CSS for Dynamic Data --- */
            .details-container {
                display: flex;
                align-items: baseline; /* Aligns the text on the same line */
                text-align: left;
            }
            .data-value {
                font-style: italic;
                text-decoration: underline;
                padding-left: 15px; /* Space between label and value */
            }
                /* --- NEW & CORRECTED CSS for single-cell layout --- */
            .details-row {
                display: flex;       /* The main container for the row's content */
                align-items: stretch;/* Makes children the same height */
                text-align: left;
            }
            .detail-item {
                padding: 8px;      /* Internal padding for each item */
            }
            .detail-item-name {
                flex-grow: 1;        /* Makes the Name section take up all available space */
            }
            .detail-item-date {
                flex-shrink: 0;      /* Prevents the Date section from shrinking */
                width: 2.5in;        /* Gives the Date section a fixed width */
            }
            .vertical-divider {
                border-left: 1px solid #000; /* Creates the vertical line */
            }
            .field-label {
                font-size: 8pt;
                color: #555;
                margin-bottom: 2px;
            }
            .field-data {
                font-size: 8pt;
            }
                /* --- NEW CSS for Nested Tables --- */
            .nested-table {
                width: 100%;
                border-collapse: collapse;
                margin: -8px; /* Negative margin to fill the parent cell's padding */
            }
            .nested-table th, .nested-table td {
                border: 1px solid #000;
                padding: 6px;
                text-align: center; /* Center-align text in this table */
                vertical-align: top;
            }
            .nested-table th {
                font-weight: bold;
                font-size: 8pt;
            }
            .data-cell {
                height: 1.5em; /* Gives the data cells a fixed height */
            }
                /* --- NEW CSS for the Dry Pipe Test section --- */
            .sub-label-cell {
                font-weight: bold;
                text-align: center;
                border: 1px solid #000;
            }
            .header-group {
                font-weight: bold;
                text-align: center;
            }
            .nested-table .footnote-cell {
                border: none;
                font-size: 8pt;
                padding-top: 10px;
            }
                /* --- NEW CSS for the Notes Box --- */
            .notes-box {
                border: 1px solid #000;
                min-height: 200px; /* Gives the box a large default size */
                padding: 8px;
                margin-top: 5px;
                white-space: pre-wrap; /* This makes sure line breaks from the database are shown in the PDF */
            }
        </style>
    </head>
    <body>
    <div class="page-container">
        <!-- HEADER (Logo Only) -->
        <header class="header">
            ${
              logoDataUri
                ? `<img src="${logoDataUri}" alt="Southern Fire Logo">`
                : "<h1>SOUTHERN FIRE</h1>"
            }
        </header>

        <!-- MAIN FORM TABLE -->
        <table class="main-form-table">
            <tbody>
                <!-- Row 1: Main Title -->
                <tr>
                    <td colspan='2'>
                        <div class="main-title">Contractor’s Material and Test Certificate for Aboveground Piping</div>
                    </td>
                </tr>

                <!-- Row 2: Procedure -->
                <tr>
                    <td colspan='2'>
                        <div class="procedure-title">PROCEDURE</div>
                        <p class="procedure-text">
                            Upon completion of work, inspection and tests shall be made by the contractor’s representative and witnessed by the property owner or 
                            their authorized agent. All defects shall be corrected and system left in service before contractor’s personnel finally leave the job.
                        </p>
                        <p class="procedure-text">
                            A certificate shall be filled out and signed by both representatives. Copies shall be prepared for approving authorities, owners, and 
                            contractor. It is understood the owner’s representative’s signature in no way prejudices any claim against contractor for faulty material, poor 
                            workmanship, or failure to comply with approving authority’s requirements or local ordinances.
                        </p>
                    </td>
                </tr>
               <!-- ROW 3: Property Name and Date (Corrected) -->
                <tr>
                    <td colspan="2" style="padding: 0;">
                        <div class="details-container">
                            <div style="padding: 8px; flex-grow: 1;">
                                Property name
                                <span class="data-value">${val(
                                  testData.propertyDetails?.propertyName
                                )}</span>
                            </div>
                            <div style="border-left: 1px solid #000; padding: 8px; width: 3in; flex-shrink: 0;">
                                Date
                                <span class="data-value">${formatDate(
                                  testData.propertyDetails?.date
                                )}</span>
                            </div>
                        </div>
                    </td>
                </tr>

                <!-- ROW 4: Property Address (Corrected) -->
                <tr>
                    <td colspan="2" style="padding: 8px; text-align: left;">
                        Property address
                        <span class="data-value">${val(
                          testData.propertyDetails?.propertyAddress
                        )}</span>
                    </td>
                </tr>
                <!-- ROW 5: Installation/Modification Questions -->
                <tr>
                    <td colspan="2" class="content-cell">
                        <div class="question-row">
                            <span>New installation?</span>
                            <div class="checkbox-group">
                                <label><input type="checkbox" ${chk(
                                  testData.propertyDetails?.isNewInstallation
                                )} disabled> Yes</label>
                                <label><input type="checkbox" ${chk(
                                  !testData.propertyDetails?.isNewInstallation
                                )} disabled> No</label>
                            </div>
                        </div>

                        <div class="question-row">
                            <span>Modification? If yes, complete applicable portions of the form.</span>
                            <div class="checkbox-group">
                                <label><input type="checkbox" ${chk(
                                  testData.propertyDetails?.isModification
                                )} disabled> Yes</label>
                                <label><input type="checkbox" ${chk(
                                  !testData.propertyDetails?.isModification
                                )} disabled> No</label>
                            </div>
                        </div>

                        <div class="info-text">
                            Provide a description of the scope of work on page 3.
                        </div>
                    </td>
                </tr>
                <!-- ROW 6: Plans (with Italic/Underline Formatting) -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Plans
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell">
                        <!-- Part 1: Text Fields -->
                        <div style="border-bottom: 1px solid #000; padding-bottom: 8px;">
                            <div class="field-row">
                                <span class="label">Accepted by approving authorities (names)</span>
                                <span class="line-value">
                                    <span class="data-value">
                                        ${val(
                                          testData.plansAndInstructions?.plans.acceptedByAuthorities.join(
                                            ", "
                                          )
                                        )}
                                    </span>
                                </span>
                            </div>
                            <div class="field-row" style="margin-top: 8px;">
                                <span class="label">Address</span>
                                <span class="line-value">
                                    <span class="data-value">
                                        ${val(
                                          testData.plansAndInstructions?.plans
                                            .address
                                        )}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <!-- Part 2: Checkbox Fields -->
                        <div style="padding-top: 8px;">
                            <div class="question-row">
                                <span>Installation conforms to accepted plans</span>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" ${chk(
                                      testData.plansAndInstructions?.plans
                                        .conformsToAcceptedPlans
                                    )} disabled> Yes</label>
                                    <label><input type="checkbox" ${chk(
                                      !testData.plansAndInstructions?.plans
                                        .conformsToAcceptedPlans
                                    )} disabled> No</label>
                                </div>
                            </div>
                            <div class="question-row">
                                <span>Equipment used is approved</span>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" ${chk(
                                      testData.plansAndInstructions?.plans
                                        .equipmentIsApproved
                                    )} disabled> Yes</label>
                                    <label><input type="checkbox" ${chk(
                                      !testData.plansAndInstructions?.plans
                                        .equipmentIsApproved
                                    )} disabled> No</label>
                                </div>
                            </div>
                            <div class="field-row" style="margin-top: 8px;">
                                <span class="label">If no, explain deviations</span>
                                <span class="line-value">
                                    <span class="data-value">
                                        ${val(
                                          testData.plansAndInstructions?.plans
                                            .deviationsExplanation
                                        )}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </td>
                </tr>
                <!-- ROW 7: Instructions -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Instructions
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell">
                        <!-- Part 1: First Question -->
                        <div style="border-bottom: 1px solid #000; padding-bottom: 8px;">
                            <div class="question-row">
                                <span>Has person in charge of fire equipment been instructed as to location of control valves and care and maintenance of this new equipment?</span>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" ${chk(
                                      testData.plansAndInstructions
                                        ?.instructions
                                        .isPersonInChargeInstructed
                                    )} disabled> Yes</label>
                                    <label><input type="checkbox" ${chk(
                                      !testData.plansAndInstructions
                                        ?.instructions
                                        .isPersonInChargeInstructed
                                    )} disabled> No</label>
                                </div>
                            </div>
                            <div class="field-row" style="margin-top: 8px;">
                                <span class="label">If no, explain</span>
                                <span class="line-value">
                                    <span class="data-value">${val(
                                      testData.plansAndInstructions
                                        ?.instructions.instructionExplanation
                                    )}</span>
                                </span>
                            </div>
                        </div>

                        <!-- Part 2: Second Question with Nested List -->
                        <div style="padding-top: 8px;">
                            <div class="question-row">
                                <span>Have copies of the following been left on the premises?</span>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" disabled> Yes</label>
                                    <label><input type="checkbox" disabled> No</label>
                                </div>
                            </div>
                            
                            <!-- Nested Checkbox List -->
                            <div style="margin-left: 20px; margin-top: 5px;">
                                <div class="question-row">
                                    <span>1. System components instructions</span>
                                    <div class="checkbox-group">
                                        <label><input type="checkbox" ${chk(
                                          testData.plansAndInstructions
                                            ?.instructions
                                            .hasSystemComponentsInstructions
                                        )} disabled> Yes</label>
                                        <label><input type="checkbox" ${chk(
                                          !testData.plansAndInstructions
                                            ?.instructions
                                            .hasSystemComponentsInstructions
                                        )} disabled> No</label>
                                    </div>
                                </div>
                                <div class="question-row">
                                    <span>2. Care and maintenance instructions</span>
                                    <div class="checkbox-group">
                                        <label><input type="checkbox" ${chk(
                                          testData.plansAndInstructions
                                            ?.instructions
                                            .hasCareAndMaintenanceInstructions
                                        )} disabled> Yes</label>
                                        <label><input type="checkbox" ${chk(
                                          !testData.plansAndInstructions
                                            ?.instructions
                                            .hasCareAndMaintenanceInstructions
                                        )} disabled> No</label>
                                    </div>
                                </div>
                                <div class="question-row">
                                    <span>3. NFPA 25</span>
                                    <div class="checkbox-group">
                                        <label><input type="checkbox" ${chk(
                                          testData.plansAndInstructions
                                            ?.instructions.hasNFPA25
                                        )} disabled> Yes</label>
                                        <label><input type="checkbox" ${chk(
                                          !testData.plansAndInstructions
                                            ?.instructions.hasNFPA25
                                        )} disabled> No</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
                <!-- ROW 8: Location of system -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Location of system
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell">
                        <div>
                            Supplies buildings
                            <span class="data-value">
                                ${val(
                                  testData.systemComponents?.suppliesBuildingsNames?.join(
                                    ", "
                                  )
                                )}
                            </span>
                        </div>
                    </td>
                </tr>
                <!-- ROW 9: Sprinklers -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Sprinklers
                    </td>

                    <!-- Right Content Cell, containing the nested table -->
                    <td>
                        <table class="nested-table">
                            <thead>
                                <tr>
                                    <th>Make</th>
                                    <th>Model</th>
                                    <th>Year of<br>manufacture</th>
                                    <th>Orifice<br>size</th>
                                    <th>Quantity</th>
                                    <th>Temperature<br>rating</th>
                                </tr>
                            </thead>
                            <tbody>
                ${(() => {
                  let rows = "";
                  const sprinklers =
                    testData.systemComponents?.sprinklers || [];
                  const minRows = 5; // Set the minimum number of rows to display
                  const rowCount = Math.max(sprinklers.length, minRows); // Loop for at least minRows, or more if data exists

                  for (let i = 0; i < rowCount; i++) {
                    const sprinkler = sprinklers[i]; // Get data for the current row, if it exists
                    rows += `
                            <tr>
                                <td class="data-cell"><span class="data-value">${val(
                                  sprinkler?.make
                                )}</span></td>
                                <td class="data-cell"><span class="data-value">${val(
                                  sprinkler?.model
                                )}</span></td>
                                <td class="data-cell"><span class="data-value">${val(
                                  sprinkler?.yearOfMfg
                                )}</span></td>
                                <td class="data-cell"><span class="data-value">${val(
                                  sprinkler?.orificeSize
                                )}</span></td>
                                <td class="data-cell"><span class="data-value">${val(
                                  sprinkler?.quantity
                                )}</span></td>
                                <td class="data-cell"><span class="data-value">${val(
                                  sprinkler?.tempRating
                                )}</span></td>
                            </tr>
                        `;
                  }
                  return rows;
                })()}
            </tbody>
                        </table>
                    </td>
                </tr>
                <!-- ROW 10: Pipe and fittings -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Pipe and fittings
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell">
                        <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
                            Type of pipe
                            <span class="data-value">
                                ${val(testData.systemComponents?.pipeAndFittings?.pipeType)}
                            </span>
                        </div>
                        <div>
                            Type of fittings
                            <span class="data-value">
                                ${val(testData.systemComponents?.pipeAndFittings?.fittingsType)}
                            </span>
                        </div>
                    </td>
                </tr>
                <!-- ROW 11: Alarm valve or flow indicator -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Alarm valve or flow indicator
                    </td>

                    <!-- Right Content Cell, containing the nested table -->
                    <td>
                        <table class="nested-table">
                            <thead>
                                <tr>
                                    <th colspan="3">Alarm device</th>
                                    <th colspan="2">Maximum time to operate<br>through test connection</th>
                                </tr>
                                <tr>
                                    <th style="width: 25%;">Type</th>
                                    <th style="width: 25%;">Make</th>
                                    <th style="width: 25%;">Model</th>
                                    <th style="width: 12.5%;">Minutes</th>
                                    <th style="width: 12.5%;">Seconds</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(() => {
                                    let rows = '';
                                    const alarms = testData.alarmsAndValves?.alarmValvesOrFlowIndicators || [];
                                    const minRows = 2; // The PDF shows 2 rows
                                    const rowCount = Math.max(alarms.length, minRows);

                                    for (let i = 0; i < rowCount; i++) {
                                        const alarm = alarms[i];
                                        rows += `
                                            <tr>
                                                <td class="data-cell"><span class="data-value">${val(alarm?.type)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(alarm?.make)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(alarm?.model)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(alarm?.maxOperationTime?.min)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(alarm?.maxOperationTime?.sec)}</span></td>
                                            </tr>
                                        `;
                                    }
                                    return rows;
                                })()}
                            </tbody>
                        </table>
                    </td>
                </tr>
                <!-- ROW 12: Dry pipe operating test (Corrected for Array) -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Dry pipe operating test
                    </td>

                    <!-- Right Content Cell, containing the nested tables -->
                    <td class="content-cell">
                        ${(() => {
                            let html = '';
                            const tests = testData.alarmsAndValves?.dryPipeOperatingTests || [];
                            
                            // If there are no tests, render one empty block to match the form
                            const testsToRender = tests.length > 0 ? tests : [{}];

                            testsToRender.forEach((test, index) => {
                                // Add a separator between multiple test blocks
                                if (index > 0) {
                                    html += `<hr style="border: none; border-top: 2px solid #000; margin: 20px 0;">`;
                                }

                                html += `
                                    <table class="nested-table">
                                        <thead>
                                            <tr>
                                                <td rowspan="2" class="sub-label-cell" style="width: 5%;">NA</td>
                                                <th colspan="3" class="header-group">Dry valve</th>
                                                <th colspan="3" class="header-group">Q. O. D.</th>
                                            </tr>
                                            <tr>
                                                <th>Make</th><th>Model</th><th>Serial no.</th>
                                                <th>Make</th><th>Model</th><th>Serial no.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td></td>
                                                <td class="data-cell"><span class="data-value">${val(test.dryValve?.make)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.dryValve?.model)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.dryValve?.serialNumber)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.qodValve?.make)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.qodValve?.model)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.qodValve?.serialNumber)}</span></td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <table class="nested-table" style="margin-top: -1px;">
                                        <thead>
                                            <tr>
                                                <td rowspan="2" class="sub-label-cell" style="border-top: none;"></td>
                                                <th colspan="2">Time to trip...<sup>a,b</sup></th>
                                                <th rowspan="2">Water<br>pressure<br>psi</th>
                                                <th rowspan="2">Air<br>pressure<br>psi</th>
                                                <th rowspan="2">Trip point<br>air pressure<br>psi</th>
                                                <th colspan="2">Time water reached...<sup>a,b</sup></th>
                                                <th colspan="2">Alarm operated<br>properly</th>
                                            </tr>
                                            <tr>
                                                <th>Minutes</th><th>Seconds</th>
                                                <th>Minutes</th><th>Seconds</th>
                                                <th>Yes</th><th>No</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td class="sub-label-cell">Without<br>Q.O.D.</td>
                                                <td class="data-cell"><span class="data-value">${val(test.timeToTripWithoutQOD?.min)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.timeToTripWithoutQOD?.sec)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.waterPressureWithoutQOD)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.airPressureWithoutQOD)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.tripPointAirPressureWithoutQOD)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.timeWaterReachedOutletWithoutQOD?.min)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.timeWaterReachedOutletWithoutQOD?.sec)}</span></td>
                                                <td class="data-cell"><input type="checkbox" ${chk(test.alarmOperatedProperlyWithoutQOD)} disabled></td>
                                                <td class="data-cell"><input type="checkbox" ${chk(!test.alarmOperatedProperlyWithoutQOD)} disabled></td>
                                            </tr>
                                            <tr>
                                                <td class="sub-label-cell">With<br>Q.O.D.</td>
                                                <td class="data-cell"><span class="data-value">${val(test.timeToTripWithQOD?.min)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.timeToTripWithQOD?.sec)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.waterPressureWithQOD)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.airPressureWithQOD)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.tripPointAirPressureWithQOD)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.timeWaterReachedOutletWithQOD?.min)}</span></td>
                                                <td class="data-cell"><span class="data-value">${val(test.timeWaterReachedOutletWithQOD?.sec)}</span></td>
                                                <td class="data-cell"><input type="checkbox" ${chk(test.alarmOperatedProperlyWithQOD)} disabled></td>
                                                <td class="data-cell"><input type="checkbox" ${chk(!test.alarmOperatedProperlyWithQOD)} disabled></td>
                                            </tr>
                                            <tr>
                                                <td colspan="10" class="content-cell">
                                                    If no, explain <span class="data-value">${val(test.explain) /* Schema needs an explanation field here */}</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                `;
                            });
                            return html;
                        })()}
                        
                        <!-- Footnotes are placed once, after all the test blocks -->
                        <div class="footnote-cell" style="border: none; font-size: 8pt; padding: 10px 0;">
                            <sup>a</sup> Measured from time inspector's test connection is opened.<br>
                            <sup>b</sup> NFPA 13 only requires the 60-second limitation in specific sections.
                        </div>
                    </td>
                </tr>
                <!-- ROW 13: Deluge and preaction valves -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Deluge and preaction valves
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell" style="padding: 0;">
                        ${(() => {
                            let html = '';
                            const valves = testData.alarmsAndValves?.delugeAndPreActionValves || [];
                            const valvesToRender = valves.length > 0 ? valves : [{}];

                            valvesToRender.forEach((valve, index) => {
                                console.log("🚀 ~ generateAbovegroundTestHtml ~ valve:", valve)
                                if (index > 0) {
                                    html += `<div style="border-top: 2px solid #000; margin: 0;"></div>`;
                                }

                                html += `
                                <table class="nested-table" style="margin:0;">
                                    <tbody>
                                        <!-- Row 1: Operation -->
                                        <tr>
                                            <td style="width: 20%; border-left: none;">Operation</td>
                                            <td colspan="4" style="border-right: none;">
                                                <div class="checkbox-group" style="justify-content: space-around;">
                                                    <label><input type="radio" name="valve_op_${index}" ${chk(valve.operation === 'pneumatic')} disabled> Pneumatic</label>
                                                    <label><input type="radio" name="valve_op_${index}" ${chk(valve.operation === 'electric')} disabled> Electric</label>
                                                    <label><input type="radio" name="valve_op_${index}" ${chk(valve.operation === 'hydraulic')} disabled> Hydraulics</label>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Row 2: Supervision -->
                                        <tr>
                                            <td style="border-left: none;">Piping supervised</td>
                                            <td style="width: 25%;">
                                                <div class="checkbox-group" style="justify-content: space-around;">
                                                    <label><input type="checkbox" ${chk(valve.isPipingSupervised)} disabled> Yes</label>
                                                    <label><input type="checkbox" ${chk(!valve.isPipingSupervised)} disabled> No</label>
                                                </div>
                                            </td>
                                            <td style="width: 25%;">Detecting media supervised</td>
                                            <td colspan="2" style="border-right: none;">
                                                <div class="checkbox-group" style="justify-content: space-around;">
                                                    <label><input type="checkbox" ${chk(valve.isDetectingMediaSupervised)} disabled> Yes</label>
                                                    <label><input type="checkbox" ${chk(!valve.isDetectingMediaSupervised)} disabled> No</label>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Row 3: Valve Operation -->
                                        <tr>
                                            <td colspan="4">Does valve operate from the manual trip, remote, or both control stations?</td>
                                            <td style="border-right: none;">
                                                <div class="checkbox-group" style="justify-content: space-around;">
                                                    <label><input type="checkbox" ${chk(valve.operatesFromManualOrRemote)} disabled> Yes</label>
                                                    <label><input type="checkbox" ${chk(!valve.operatesFromManualOrRemote)} disabled> No</label>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Row 4: Testing Facility -->
                                        <tr>
                                            <td colspan="2">
                                                Is there an accessible facility in each circuit for testing?
                                                <div class="checkbox-group" style="padding-top: 5px;">
                                                    <label><input type="checkbox" ${chk(valve.isAccessibleForTesting)} disabled> Yes</label>
                                                    <label><input type="checkbox" ${chk(!valve.isAccessibleForTesting)} disabled> No</label>
                                                </div>
                                            </td>
                                            <td colspan="3" style="border-right: none;">
                                                If no, explain
                                                <div class="data-value" style="border-bottom: 1px solid #000; min-height: 1.2em;">${val(valve.explanation)}</div>
                                            </td>
                                        </tr>

                                        <!-- Row 5: Details Grid -->
                                        <tr>
                                            <td colspan="5" style="padding: 0; border-right: none;">
                                                <table class="nested-table" style="margin: 0;">
                                                    <thead>
                                                        <tr>
                                                            <th style="width: 20%;">Make</th>
                                                            <th style="width: 20%;">Model</th>
                                                            <th colspan="2">Does each circuit operate<br>supervision loss alarm?</th>
                                                            <th colspan="2">Does each circuit operate<br>valve release?</th>
                                                            <th colspan="2">Maximum time to<br>operate release</th>
                                                        </tr>
                                                        <tr>
                                                            <td></td><td></td>
                                                            <th>Yes</th><th>No</th>
                                                            <th>Yes</th><th>No</th>
                                                            <th>Minutes</th><th>Seconds</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td class="data-cell"><span class="data-value">${val(valve.make)}</span></td>
                                                            <td class="data-cell"><span class="data-value">${val(valve.model)}</span></td>
                                                            <td class="data-cell"><input type="checkbox" ${chk(valve.doesSupervisionLossAlarmOperate)} disabled></td>
                                                            <td class="data-cell"><input type="checkbox" ${chk(!valve.doesSupervisionLossAlarmOperate)} disabled></td>
                                                            <td class="data-cell"><input type="checkbox" ${chk(valve.doesValveReleaseOperate)} disabled></td>
                                                            <td class="data-cell"><input type="checkbox" ${chk(!valve.doesValveReleaseOperate)} disabled></td>
                                                            <td class="data-cell"><span class="data-value">${val(valve.maxTimeToOperateRelease?.min)}</span></td>
                                                            <td class="data-cell"><span class="data-value">${val(valve.maxTimeToOperateRelease?.sec)}</span></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                `;
                            });
                            return html;
                        })()}
                    </td>
                </tr>
                <!-- ROW 14: Pressure-reducing valve test -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Pressure-reducing valve test
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell" style="padding: 0;">
                        ${(() => {
                            let html = '';
                            const tests = testData.alarmsAndValves?.pressureReducingValveTests || [];
                            const testsToRender = tests.length > 0 ? tests : [{}]; // Render at least one empty block

                            testsToRender.forEach((test, index) => {
                                if (index > 0) {
                                    html += `<div style="border-top: 2px solid #000; margin: 0;"></div>`;
                                }

                                html += `
                                <table class="nested-table" style="margin: 0;">
                                    <thead>
                                        <tr>
                                            <th style="width: 15%;">Location and floor</th>
                                            <th style="width: 15%;">Make and model</th>
                                            <th style="width: 10%;">Setting</th>
                                            <th colspan="2">Static pressure</th>
                                            <th colspan="2">Residual pressure (flowing)</th>
                                            <th style="width: 10%;">Flow rate</th>
                                        </tr>
                                        <tr>
                                            <td></td><td></td><td></td>
                                            <th>Inlet (psi)</th>
                                            <th>Outlet (psi)</th>
                                            <th>Inlet (psi)</th>
                                            <th>Outlet (psi)</th>
                                            <th>Flow (gpm)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="data-cell"><span class="data-value">${val(test.locationAndFloor)}</span></td>
                                            <td class="data-cell"><span class="data-value">${val(test.makeAndModel)}</span></td>
                                            <td class="data-cell"><span class="data-value">${val(test.setting)}</span></td>
                                            <td class="data-cell"><span class="data-value">${val(test.staticPressure?.inlet)}</span></td>
                                            <td class="data-cell"><span class="data-value">${val(test.staticPressure?.outlet)}</span></td>
                                            <td class="data-cell"><span class="data-value">${val(test.residualPressure?.inlet)}</span></td>
                                            <td class="data-cell"><span class="data-value">${val(test.residualPressure?.outlet)}</span></td>
                                            <td class="data-cell"><span class="data-value">${val(test.flowRate)}</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                                `;
                            });
                            return html;
                        })()}
                    </td>
                </tr>

               <!-- ROW 15: Backflow device forward flow test -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Backflow device forward flow test
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell">
                        <div>
                            Indicate means used for forward flow test of backflow device:
                            <span class="data-value">
                                ${val(testData.testing?.backflowTest?.meansUsed)}
                            </span>
                        </div>
                        <div class="question-row" style="margin-top: 10px;">
                            <span>When means to test device was opened, was system flow demand created?</span>
                            <div class="checkbox-group">
                                <label><input type="checkbox" ${chk(testData.testing?.backflowTest?.wasFlowDemandCreated === 'Yes')} disabled> Yes</label>
                                <label><input type="checkbox" ${chk(testData.testing?.backflowTest?.wasFlowDemandCreated === 'No')} disabled> No</label>
                                <label><input type="checkbox" ${chk(testData.testing?.backflowTest?.wasFlowDemandCreated === 'N/A')} disabled> N/A</label>
                            </div>
                        </div>
                    </td>
                </tr>
                <!-- PAGE 2 - ROW 1: Test description -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Test description
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell">
                        <div class="test-description-content">
                            <p>
                                <u>Hydrostatic:</u> Hydrostatic tests shall be made at not less than 200 psi (13.8 bar) for 2 hours or 50 psi (3.4 bar) above static pressure in excess of 150 psi (10.3 bar) for 2 hours. Differential dry pipe valve clappers shall be left open during the test to prevent damage. All aboveground piping leakage shall be stopped.
                            </p>
                            <p>
                                <u>Pneumatic:</u> Establish 40 psi (2.7 bar) air pressure and measure drop, which shall not exceed 1½ psi (0.1 bar) in 24 hours. Test pressure tanks at normal water level and air pressure and measure air pressure drop, which shall not exceed 1½ psi (0.1 bar) in 24 hours.
                            </p>
                        </div>
                    </td>
                </tr>

                <!-- PAGE 2 - ROW 2: Tests -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Tests
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell">
                        <!-- Part 1: Hydrostatic/Pneumatic Tests -->
                        <div style="border-bottom: 1px solid #000; padding-bottom: 8px;">
                            <div class="field-row">
                                <div style="flex-grow: 2;">
                                    All piping hydrostatically tested at
                                    <span class="data-value">${val(testData.testing?.hydrostaticTest?.pressurePsi)}</span> psi (
                                    <span class="data-value">${val(testData.testing?.hydrostaticTest?.pressureBar)}</span> bar) for
                                    <span class="data-value">${val(testData.testing?.hydrostaticTest?.durationHrs)}</span> hours
                                </div>
                                <div style="flex-grow: 1; border-left: 1px solid #000; padding-left: 8px;">
                                    If no, state reason
                                    <div class="data-value" style="min-height: 1.2em;">${val(testData.testing?.improperOperationReason)}</div>
                                </div>
                            </div>
                            <div class="question-row">
                                <span>Dry piping pneumatically tested</span>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" ${chk(testData.testing?.isDryPipingPneumaticallyTested)} disabled> Yes</label>
                                    <label><input type="checkbox" ${chk(!testData.testing?.isDryPipingPneumaticallyTested)} disabled> No</label>
                                </div>
                            </div>
                            <div class="question-row">
                                <span>Equipment operates properly</span>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" ${chk(testData.testing?.doesEquipmentOperateProperly)} disabled> Yes</label>
                                    <label><input type="checkbox" ${chk(!testData.testing?.doesEquipmentOperateProperly)} disabled> No</label>
                                </div>
                            </div>
                        </div>

                        <!-- Part 2: Corrosive Chemicals Certification -->
                        <div class="question-row" style="border-bottom: 1px solid #000; padding: 8px 0;">
                            <span style="flex-grow: 1;">Do you certify as the sprinkler contractor that additives and corrosive chemicals, sodium silicate or derivatives of sodium silicate, brine, or other corrosive chemicals were not used for testing systems or stopping leaks?</span>
                            <div class="checkbox-group">
                                <label><input type="checkbox" ${chk(testData.testing?.noCorrosiveChemicalsCertification)} disabled> Yes</label>
                                <label><input type="checkbox" ${chk(!testData.testing?.noCorrosiveChemicalsCertification)} disabled> No</label>
                            </div>
                        </div>

                        <!-- Part 3: Drain Test -->
                        <div class="field-row" style="border-bottom: 1px solid #000; padding: 8px 0;">
                            <strong style="align-self: center;">Drain test</strong>
                            <div style="flex-grow: 1; margin-left: 15px;">
                                Reading of gauge located near water supply test connection:
                                <span class="data-value">${val(testData.testing?.drainTest?.gaugeReadingPsi)}</span> psi (
                                <span class="data-value">${val(testData.testing?.drainTest?.gaugeReadingBar)}</span> bar)
                            </div>
                            <div style="flex-grow: 1; border-left: 1px solid #000; padding-left: 8px;">
                                Residual pressure with valve in test connection open wide:
                                <span class="data-value">${val(testData.testing?.drainTest?.residualPressurePsi)}</span> psi (
                                <span class="data-value">${val(testData.testing?.drainTest?.residualPressureBar)}</span> bar)
                            </div>
                        </div>

                        <!-- Part 4: Underground Piping -->
                        <div style="border-bottom: 1px solid #000; padding: 8px 0;">
                            <p>Underground mains and lead-in connections to system risers flushed before connection made to sprinkler piping</p>
                            <div class="question-row">
                                <span>Verified by copy of the Contractor's Material and Test Certificate for Underground Piping.</span>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" ${chk(testData.testing?.undergroundPiping?.isVerifiedByCertificate)} disabled> Yes</label>
                                    <label><input type="checkbox" ${chk(!testData.testing?.undergroundPiping?.isVerifiedByCertificate)} disabled> No</label>
                                    <span style="margin-left: 15px;">Other</span>
                                    <span class="data-value" style="flex-grow:1; min-width: 50px;">${val(testData.testing?.undergroundPiping?.explanation)}</span>
                                </div>
                            </div>
                            <div class="question-row">
                                <span>Flushed by installer of underground sprinkler piping</span>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" ${chk(testData.testing?.undergroundPiping?.wasFlushedByInstaller)} disabled> Yes</label>
                                    <label><input type="checkbox" ${chk(!testData.testing?.undergroundPiping?.wasFlushedByInstaller)} disabled> No</label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Part 5: Powder-Driven Fasteners -->
                        <div style="padding-top: 8px;">
                            <div class="field-row">
                                <div style="flex-grow: 1;">
                                    <div class="question-row">
                                        <span>If powder-driven fasteners are used in concrete, has representative sample testing been satisfactorily completed?</span>
                                        <div class="checkbox-group">
                                            <label><input type="checkbox" ${chk(testData.testing?.powderDrivenFasteners?.isTestingSatisfactory)} disabled> Yes</label>
                                            <label><input type="checkbox" ${chk(!testData.testing?.powderDrivenFasteners?.isTestingSatisfactory)} disabled> No</label>
                                        </div>
                                    </div>
                                </div>
                                <div style="flex-grow: 1; border-left: 1px solid #000; padding-left: 8px;">
                                    If no, explain
                                    <div class="data-value" style="min-height: 1.2em;">${val(testData.testing?.powderDrivenFasteners?.explanation)}</div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
                <!-- PAGE 2 - ROW 3: Blank testing gaskets -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Blank testing gaskets
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell" style="padding: 0;">
                        <table class="nested-table" style="margin: 0;">
                            <thead>
                                <tr>
                                    <th style="width: 20%;">Number used</th>
                                    <th style="width: 50%;">Locations</th>
                                    <th style="width: 30%;">Number removed</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="data-cell">
                                        <span class="data-value">
                                            ${val(testData.testing?.blankTestingGaskets?.numberUsed)}
                                        </span>
                                    </td>
                                    <td class="data-cell">
                                        <span class="data-value">
                                            ${val(testData.testing?.blankTestingGaskets?.locations)}
                                        </span>
                                    </td>
                                    <td class="data-cell">
                                        <span class="data-value">
                                            ${val(testData.testing?.blankTestingGaskets?.numberRemoved)}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <!-- PAGE 2 - ROW 4: Welding -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Welding
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell">
                        <div style="border-bottom: 1px solid #000; padding-bottom: 8px;">
                            <div class="question-row">
                                <span>Welding piping</span>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" ${chk(testData.weldingAndCutouts?.isWeldingPiping)} disabled> Yes</label>
                                    <label><input type="checkbox" ${chk(!testData.weldingAndCutouts?.isWeldingPiping)} disabled> No</label>
                                </div>
                            </div>
                        </div>

                        ${(() => {
                            // Only show the certification questions if isWeldingPiping is true
                            if (testData.weldingAndCutouts?.isWeldingPiping) {
                                return `
                                <div style="padding-top: 8px;">
                                    <div style="text-align: center; font-style: italic; margin-bottom: 10px;">If yes ...</div>
                                    
                                    <div class="question-row">
                                        <span style="font-size: 8pt;">Do you certify as the sprinkler contractor that welding procedures used complied with the minimum requirements of AWS B2.1, ASME Section IX <i>Welding and Brazing Qualifications</i>, or other applicable qualification standard as required by the AHJ?</span>
                                        <div class="checkbox-group">
                                            <label><input type="checkbox" ${chk(testData.weldingAndCutouts?.certifications?.awsB21Compliant)} disabled> Yes</label>
                                            <label><input type="checkbox" ${chk(!testData.weldingAndCutouts?.certifications?.awsB21Compliant)} disabled> No</label>
                                        </div>
                                    </div>
                                    
                                    <div class="question-row" style="margin-top: 10px;">
                                        <span style="font-size: 8pt;">Do you certify that all welding was performed by welders or welding operators qualified in accordance with the minimum requirements of AWS B2.1, ASME Section IX <i>Welding and Brazing Qualifications</i>, or other applicable qualification standard as required by the AHJ?</span>
                                        <div class="checkbox-group">
                                            <label><input type="checkbox" ${chk(testData.weldingAndCutouts?.certifications?.weldersQualified)} disabled> Yes</label>
                                            <label><input type="checkbox" ${chk(!testData.weldingAndCutouts?.certifications?.weldersQualified)} disabled> No</label>
                                        </div>
                                    </div>

                                    <div class="question-row" style="margin-top: 10px;">
                                        <span style="font-size: 8pt;">Do you certify that the welding was conducted in compliance with a documented quality control procedure to ensure that (1) all discs are retrieved; (2) that openings in piping are smooth, that slag and other welding residue are removed; (3) the internal diameters of piping are not penetrated; (4) completed welds are free from cracks, incomplete fusion, surface porosity greater than 1/16 in. (1.6 mm) diameter, undercut deeper than the lesser of 25% of the wall thickness or 1/32 in. (0.8 mm); and (5) completed circumferential butt weld reinforcement does not exceed 3/32 in. (2.4 mm)?</span>
                                        <div class="checkbox-group">
                                            <label><input type="checkbox" ${chk(testData.weldingAndCutouts?.certifications?.qualityControlProcedureCompliant)} disabled> Yes</label>
                                            <label><input type="checkbox" ${chk(!testData.weldingAndCutouts?.certifications?.qualityControlProcedureCompliant)} disabled> No</label>
                                        </div>
                                    </div>
                                </div>
                                `;
                            }
                            return ''; // Return empty string if isWeldingPiping is false
                        })()}
                    </td>
                </tr>
                <!-- PAGE 3 - ROW 1: Cutouts (discs) -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Cutouts<br>(discs)
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell">
                        <div class="question-row">
                            <span>Do you certify that you have a control feature to ensure that all cutouts (discs) are retrieved?</span>
                            <div class="checkbox-group">
                                <label><input type="checkbox" ${chk(testData.weldingAndCutouts?.cutouts?.hasRetrievalControl)} disabled> Yes</label>
                                <label><input type="checkbox" ${chk(!testData.weldingAndCutouts?.cutouts?.hasRetrievalControl)} disabled> No</label>
                            </div>
                        </div>
                    </td>
                </tr>
                <!-- PAGE 3 - ROW 2: Hydraulic data nameplate -->
                <tr>
                    <!-- Left Label Cell -->
                    <td class="row-label-cell">
                        Hydraulic data nameplate
                    </td>

                    <!-- Right Content Cell -->
                    <td class="content-cell">
                        <div class="field-row">
                            <div style="flex-grow: 1;">
                                <div class="question-row">
                                    <span>Nameplate provided</span>
                                    <div class="checkbox-group">
                                        <label><input type="checkbox" ${chk(testData.finalChecks?.hasHydraulicDataNameplate)} disabled> Yes</label>
                                        <label><input type="checkbox" ${chk(!testData.finalChecks?.hasHydraulicDataNameplate)} disabled> No</label>
                                    </div>
                                </div>
                            </div>
                            <div style="flex-grow: 1; border-left: 1px solid #000; padding-left: 8px;">
                                If no, explain
                                <div class="data-value" style="min-height: 1.2em;">${val(testData.finalChecks?.nameplateExplanation)}</div>
                            </div>
                        </div>
                    </td>
                </tr>

                <!-- PAGE 3 - ROW 3: Sprinkler contractor removed all caps and straps? -->
                <tr>
                    <td colspan="2" class="content-cell">
                        <div class="question-row">
                            <span>Sprinkler contractor removed all caps and straps?</span>
                            <div class="checkbox-group">
                                <label><input type="checkbox" ${chk(testData.finalChecks?.areCapsAndStrapsRemoved)} disabled> Yes</label>
                                <label><input type="checkbox" ${chk(!testData.finalChecks?.areCapsAndStrapsRemoved)} disabled> No</label>
                            </div>
                        </div>
                    </td>
                </tr>

                <!-- PAGE 3 - ROW 4: Remarks -->
                <tr>
                    <td class="row-label-cell">
                        Remarks
                    </td>
                    <td class="content-cell">
                        <div>
                            Date left in service with all control valves open
                            <span class="data-value">${formatDate(testData.remarksAndSignatures?.dateLeftInService)}</span>
                        </div>
                        <div style="margin-top: 8px;">
                            Name of sprinkler contractor
                            <span class="data-value">${val(testData.remarksAndSignatures?.sprinklerContractorName)}</span>
                        </div>
                    </td>
                </tr>

                <!-- PAGE 3 - ROW 5: Signatures -->
                <tr>
                    <td class="row-label-cell">
                        Signatures
                    </td>
                    <td class="content-cell">
                        <div class="signatures-title">Tests witnessed by</div>
                        
                        <!-- Fire Marshal Signature -->
                        <div class="field-row" style="margin-top: 15px;">
                            <div style="flex-grow: 2;">
                                <div class="line">
                                    ${fireMarshalOrAHJSign ? `<img src="${fireMarshalOrAHJSign}" style="max-height: 70px; width: auto;">` : ''}
                                </div>
                                <div style="font-size: 8pt;">Fire Marshal or AHJ (signed)</div>
                            </div>
                            <div style="flex-grow: 1; margin-left: 20px;">
                                <div class="line"><span class="data-value">${val(testData.remarksAndSignatures?.fireMarshalOrAHJ?.title)}</span></div>
                                <div style="font-size: 8pt;">Title</div>
                            </div>
                            <div style="width: 1.5in; margin-left: 20px;">
                                <div class="line"><span class="data-value">${formatDate(testData.remarksAndSignatures?.fireMarshalOrAHJ?.date)}</span></div>
                                <div style="font-size: 8pt;">Date</div>
                            </div>
                        </div>

                        <!-- Sprinkler Contractor Signature -->
                        <div class="field-row" style="margin-top: 25px;">
                            <div style="flex-grow: 2;">
                                <div class="line">
                                    ${sprinklerContractorSign ? `<img src="${sprinklerContractorSign}" style="height: 70px; width: auto;">` : ''}
                                </div>
                                <div style="font-size: 8pt;">For sprinkler contractor (signed)</div>
                            </div>
                            <div style="flex-grow: 1; margin-left: 20px;">
                                <div class="line"><span class="data-value">${val(testData.remarksAndSignatures?.sprinklerContractor?.title)}</span></div>
                                <div style="font-size: 8pt;">Title</div>
                            </div>
                            <div style="width: 1.5in; margin-left: 20px;">
                                <div class="line"><span class="data-value">${formatDate(testData.remarksAndSignatures?.sprinklerContractor?.date)}</span></div>
                                <div style="font-size: 8pt;">Date</div>
                            </div>
                        </div>
                    </td>
                </tr>
                <!-- PAGE 3 - FINAL ROW: Additional explanations and notes -->
                <tr>
                    <td colspan="2" class="content-cell">
                        <strong>Additional explanations and notes</strong>
                        <div class="notes-box">
                            <span class="data-value">${val(testData.notes)}</span>
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
