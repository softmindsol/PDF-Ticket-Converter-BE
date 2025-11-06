import fs from "fs/promises";
import path from "path";
export const generateAlarmProfileHtml = async (alarmData) => {
  if (!alarmData || !alarmData._id) {
    throw new Error("A valid alarm object with an _id must be provided.");
  }
  const val = (field, fallback = "") => (field ? String(field) : fallback);
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };
  const renderVal = (text) => (text.trim() === "" ? "&nbsp;" : text);
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>Alarm Monitoring Services - Dealer Instructions</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              font-size: 10pt;
              color: #000;
          }
          .container {
              max-width: 850px;
              margin: auto;
              padding: 15px;
          }
          .header {
              text-align: center;
              margin-bottom: 30px;
          }
          .header h1 {
              font-size: 16pt;
              margin-bottom: 5px;
              font-weight: bold;
          }
          .header h2 {
              font-size: 14pt;
              margin-top: 0;
              font-weight: bold;
          }
          .field-row {
              display: flex;
              flex-wrap: nowrap;
              gap: 25px;
              margin-bottom: 7px;
              align-items: baseline;
          }
          .field {
              display: flex;
              align-items: baseline;
              flex-grow: 1;
              flex-shrink: 1;
          }
          .field-label {
              font-weight: bold;
              white-space: nowrap;
              margin-right: 8px;
          }
          .field-value {
              width: 100%;
              border-bottom: 1.2px solid #000;
              padding-bottom: 2px;
              font-size: 9.5pt;
              text-indent: 4px;
          }
          .alarm-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 9pt;
          }
          .alarm-table th, .alarm-table td {
              border: 1px solid #000;
              padding: 4px;
              text-align: center;
          }
          .alarm-table th {
              background-color: #f2f2f2;
              font-weight: bold;
          }
          .zone-description {
              text-align: left;
          }
          .instruction-cell {
              font-size: 8pt;
          }
          /* === PERFECT GRID ALIGNMENT === */
          /* All columns use exact same width across entire table */
          .col-partition { width: 5%; }
          .col-zone { width: 9%; }
          .col-code { width: 9%; }
          .col-desc { width: 9%; }
          .col-inst { width: 8%; }
          .partition-num { text-align: center; }
          .partition-desc { text-align: left; }
          /* Force consistent column widths */
          .alarm-table colgroup {
              display: table-column-group;
          }
          .signature-container {
              display: flex;
              justify-content: space-between; /* This is correct */
              align-items: flex-end;       /* <-- ADD THIS LINE */
              font-family: sans-serif;
              font-size: 7pt;
              margin: 40px 0; /* Adjusted margin slightly for better integration */
          }

  .signature-block {
    width: 45%; /* Assigns a width to each block */
  }

  .signature-line {
    border-bottom: 1px solid black; /* Creates the signature line */
    margin-top: 40px; /* Adds space between the text and the line */
  }

  .label {
    margin-bottom: 5px;
  }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>ALARM MONITORING SERVICES</h1>
              <h2>DEALER INSTRUCTIONS - ZONES & PARTITIONS</h2>
          </div>
          <!-- Row 1 -->
          <div class="field-row">
              <div class="field" style="flex-basis: 25%;">
                  <span class="field-label">Account #</span>
                  <span class="field-value">${renderVal(
                    val(alarmData.accountNumber)
                  )}</span>
              </div>
              <div class="field" style="flex-basis: 40%;">
                  <span class="field-label">Dealer Name</span>
                  <span class="field-value">${renderVal(
                    val(alarmData.dealerName)
                  )}</span>
              </div>
              <div class="field" style="flex-basis: 10%;">
                  <span class="field-label">Dealer Code</span>
                  <span class="field-value">${renderVal(
                    val(alarmData.dealerCode)
                  )}</span>
              </div>
              <div class="field" style="flex-basis: 25%;">
                  <span class="field-label">Start Date</span>
                  <span class="field-value">${renderVal(
                    formatDate(alarmData.startDate)
                  )}</span>
              </div>
          </div>
          <!-- Row 2 -->
          <div class="field-row">
              <div class="field" style="flex-basis: 100%;">
                  <span class="field-label">Subscriber Name</span>
                  <span class="field-value">${renderVal(
                    val(alarmData.subscriberName)
                  )}</span>
              </div>
          </div>
          <!-- Row 3 -->
          <div class="field-row">
              <div class="field" style="flex-basis: 60%;">
                  <span class="field-label">Installation Address</span>
                  <span class="field-value">${renderVal(
                    val(alarmData.installationAddress)
                  )}</span>
              </div>
              <div class="field" style="flex-basis: 15%;">
                  <span class="field-label">City</span>
                  <span class="field-value">${renderVal(
                    val(alarmData.city)
                  )}</span>
              </div>
              <div class="field" style="flex-basis: 13%;">
                  <span class="field-label">State</span>
                  <span class="field-value">${renderVal(
                    val(alarmData.state)
                  )}</span>
              </div>
              <div class="field" style="flex-basis: 12%;">
                  <span class="field-label">Zip</span>
                  <span class="field-value">${renderVal(
                    val(alarmData.zip)
                  )}</span>
              </div>
          </div>
          <!-- Row 4 -->
          <div class="field-row">
              <div class="field" style="flex-basis: 100%;">
                  <span class="field-label">Communicator Format</span>
                  <span class="field-value">${renderVal(
                    val(alarmData.communicatorFormat)
                  )}</span>
              </div>
          </div>
          <table class="alarm-table">
              <!-- Enforce exact column widths at table level -->
              <colgroup>
                  <col class="col-partition">
                  <col class="col-zone">
                  <col class="col-code">
                  <col class="col-code">
                  <col class="col-desc">
                  <col class="col-desc">
                  <col class="col-desc">
                  <col class="col-desc">
                  <col class="col-inst">
                  <col class="col-inst">
                  <col class="col-inst">
                  <col class="col-inst">
              </colgroup>
              <thead>
                  <tr>
                      <th rowspan="2">Partition/<br/>Area #</th>
                      <th rowspan="2">Zone #</th>
                      <th rowspan="2" colspan="2">Code<br/>Description</th>
                      <th rowspan="2" colspan="4">Zone Description</th>
                      <th colspan="4">Instructions (Use Initials Below)</th>
                  </tr>
                  <tr>
                      <th>1st</th>
                      <th>2nd</th>
                      <th>3rd</th>
                      <th>4th</th>
                  </tr>
              </thead>
              <tbody>
                  ${(() => {
                    const minRows = 10;
                    let tableRows = "";
                    const areas = alarmData.areas || [];
                    for (let i = 0; i < areas.length; i++) {
                      const area = areas[i];
                      tableRows += `
                        <tr>
                            <td>${renderVal(val(area.areaNumber))}</td>
                            <td>${renderVal(val(area.zoneNumber))}</td>
                            <td colspan="2">${renderVal(
                              val(area.codeDescription)
                            )}</td>
                            <td colspan="4" class="zone-description">${renderVal(
                              val(area.zoneDescription)
                            )}</td>
                            <td class="instruction-cell">${renderVal(
                              val(area.instruction1)
                            )}</td>
                            <td class="instruction-cell">${renderVal(
                              val(area.instruction2)
                            )}</td>
                            <td class="instruction-cell">${renderVal(
                              val(area.instruction3)
                            )}</td>
                            <td class="instruction-cell">${renderVal(
                              val(area.instruction4)
                            )}</td>
                        </tr>
                      `;
                    }
                    for (let i = areas.length; i < minRows; i++) {
                      tableRows += `
                        <tr>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td colspan="2">&nbsp;</td>
                            <td colspan="4" class="zone-description">&nbsp;</td>
                            <td class="instruction-cell">&nbsp;</td>
                            <td class="instruction-cell">&nbsp;</td>
                            <td class="instruction-cell">&nbsp;</td>
                            <td class="instruction-cell">&nbsp;</td>
                        </tr>
                      `;
                    }
                    return tableRows;
                  })()}
                  <!-- Partition Descriptions Section -->
                  ${(() => {
                    let uniqueDescriptions = [];
                    if (alarmData.areas && Array.isArray(alarmData.areas)) {
                      uniqueDescriptions = [
                        ...new Set(
                          alarmData.areas
                            .map((area) => val(area.partitionAreaDescription))
                            .filter((d) => d.trim() !== "")
                        ),
                      ];
                    }
                    const numDescriptions = uniqueDescriptions.length;
                    const numRows = Math.ceil(numDescriptions / 2);
                    let partitionTitle = `
                      <tr style="border-top: 2px solid #000;">
                          <td colspan="8" style="text-align: left; font-weight: bold; background-color: #f2f2f2; padding: 6px;">
                              Partition/Area Descriptions (Complete an SIS for Each Partition)
                          </td>
                          <td colspan="4" rowspan="${
                            1 + numRows
                          }" style="vertical-align: top; text-align: left; padding: 8px; font-size: 8.5pt; line-height: 1.6;">
                              <div><strong>VN</strong>&nbsp;&nbsp;Verification</div>
                              <div><strong>NA</strong>&nbsp;&nbsp;Numbers Notify Authorities</div>
                              <div><strong>NC</strong>&nbsp;&nbsp;Notify Contact</div>
                              <div><strong>ND</strong>&nbsp;&nbsp;Notify Dealer</div>
                              <div><strong>NG</strong>&nbsp;&nbsp;Notify Guard</div>
                          </td>
                      </tr>
                    `;
                    let partitionRows = "";
                    let descIndex = 0;
                    for (let row = 0; row < numRows; row++) {
                      partitionRows += `<tr>`;
                      // Left partition
                      if (descIndex < numDescriptions) {
                        partitionRows += `
                          <td class="partition-num">${descIndex + 1}.</td>
                          <td colspan="3" class="partition-desc zone-description">${renderVal(
                            uniqueDescriptions[descIndex]
                          )}</td>
                        `;
                        descIndex++;
                      } else {
                        partitionRows += `<td>&nbsp;</td><td colspan="3">&nbsp;</td>`;
                      }
                      // Right partition
                      if (descIndex < numDescriptions) {
                        partitionRows += `
                          <td class="partition-num">${descIndex + 1}.</td>
                          <td colspan="3" class="partition-desc zone-description">${renderVal(
                            uniqueDescriptions[descIndex]
                          )}</td>
                        `;
                        descIndex++;
                      } else {
                        partitionRows += `<td>&nbsp;</td><td colspan="3">&nbsp;</td>`;
                      }
                      partitionRows += `</tr>`;
                    }
                    return partitionTitle + partitionRows;
                  })()}
              </tbody>
          </table>
          <div style="margin-top: 20px; text-align: center; font-size: 8pt;">
          <div class="signature-container">
  <div class="signature-block">
    <div class="label">ALARM MONITORING SERVICES, INC.</div>
    <div>BY:</div>
    <div class="signature-line"></div>
  </div>
  <div class="signature-block">
    <div class="label" style="text-align: left;">DEALER</div>
    <div class="signature-line"></div>
  </div>
</div>
      </div>
  </body>
  </html>
  `;
  return htmlContent;
};
