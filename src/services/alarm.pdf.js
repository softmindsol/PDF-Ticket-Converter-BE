import fs from "fs/promises";
import path from "path";

export const generateAlarmProfileHtml = async (alarmData) => {
  if (!alarmData || !alarmData._id) {
    throw new Error("A valid alarm object with an _id must be provided.");
  }

  // Helper function to safely convert fields to strings
  const val = (field, fallback = "") => (field ? String(field) : fallback);

  // Format date to MM/DD/YYYY, if it exists
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

  // Render an HTML non-breaking space if the value is empty, otherwise render the text
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

          /* Flexbox layout for rows */
          .field-row {
              display: flex;
              flex-wrap: nowrap; /* Ensures fields stay on one line */
              gap: 25px; /* Creates horizontal space between fields */
              margin-bottom: 7px; /* Creates vertical space between rows */
              align-items: baseline;
          }

          /* Container for a single label/value pair */
          .field {
              display: flex;
              align-items: baseline;
              flex-grow: 1; /* Allows field to grow */
              flex-shrink: 1; /* Allows field to shrink if needed */
          }

          .field-label {
              font-weight: bold;
              white-space: nowrap;
              margin-right: 8px;
          }

          .field-value {
              width: 100%; /* Makes the value (and underline) fill the space */
              border-bottom: 1.2px solid #000;
              padding-bottom: 2px;
              font-size: 9.5pt;
              text-indent: 4px; /* Small space before text starts */
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
              <div class="field" style="flex-basis: 18%;">
                  <span class="field-label">Account #</span>
                  <span class="field-value">${renderVal(
                    val(alarmData.accountNumber)
                  )}</span>
              </div>
              <div class="field" style="flex-basis: 32%;">
                  <span class="field-label">Dealer Name</span>
                  <span class="field-value">${renderVal(
                    val(alarmData.dealerName)
                  )}</span>
              </div>
              <div class="field" style="flex-basis: 25%;">
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
              <div class="field" style="flex-basis: 45%;">
                  <span class="field-label">Installation Address</span>
                  <span class="field-value">${renderVal(
                    val(alarmData.installationAddress)
                  )}</span>
              </div>
              <div class="field" style="flex-basis: 25%;">
                  <span class="field-label">City</span>
                  <span class="field-value">${renderVal(
                    val(alarmData.city)
                  )}</span>
              </div>
              <div class="field" style="flex-basis: 15%;">
                  <span class="field-label">State</span>
                  <span class="field-value">${renderVal(
                    val(alarmData.state)
                  )}</span>
              </div>
              <div class="field" style="flex-basis: 15%;">
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

      </div>
  </body>
  </html>
  `;

  return htmlContent;
};
