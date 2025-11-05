import fs from "fs/promises";
import path from "path";

export const generateAlarmProfileHtml = async (alarmData) => {
  if (!alarmData || !alarmData._id) {
    throw new Error("A valid alarm object with an _id must be provided.");
  }

  // Helper function to safely access properties and provide a default value
  const val = (field, fallback = "&nbsp;") => (field ? field : fallback);
  
  // Format date to MM/DD/YYYY, if it exists
  const formatDate = (dateString) => {
    if (!dateString) return "&nbsp;";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Dynamically generate the rows for the communicator/zones table
  const communicatorRows = alarmData.communicatorFormat
    .map(
      (comm) => `
    <tr>
      <td>${val(comm.areaNumber)}</td>
      <td>${val(comm.zoneNumber)}</td>
      <td>${val(comm.zoneDescription)}</td>
      <td>${val(comm.partitionAreaDescription)}</td>
      <td>${val(comm.instruction1)}</td>
      <td>${val(comm.instruction2)}</td>
      <td>${val(comm.instruction3)}</td>
      <td>${val(comm.instruction4)}</td>
    </tr>
  `
    )
    .join("");

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>Alarm Monitoring Services - Dealer Instructions</title>
      <style>
          body { font-family: Arial, sans-serif; font-size: 10pt; color: #333; }
          .container { max-width: 800px; margin: auto; padding: 20px; }
          h1 { text-align: center; margin-bottom: 2px; }
          h2 { text-align: center; margin-top: 0; margin-bottom: 20px; font-weight: normal; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px 20px; margin-bottom: 20px; }
          .info-item { border-bottom: 1px solid #000; padding: 4px 0; }
          .info-item strong { font-size: 9pt; }
          .full-width { grid-column: 1 / -1; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 6px; text-align: left; font-size: 9pt; }
          th { background-color: #f2f2f2; }
          .instructions-header { text-align: center; }
          .footer { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; }
          .footer-item { padding-top: 40px; border-top: 1px solid #000; }
          .verification-box { margin-top: 20px; border: 1px solid #000; padding: 10px; }
          .verification-box h3 { margin-top: 0; }
          .verification-list p { margin: 2px 0; }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>ALARM MONITORING SERVICES</h1>
          <h2>DEALER INSTRUCTIONS - ZONES & PARTITIONS</h2>

          <div class="info-grid">
              <div class="info-item"><strong>Account #:</strong> ${val(
                alarmData.accountNumber
              )}</div>
              <div class="info-item"><strong>Dealer Name:</strong> ${val(
                alarmData.dealerName
              )}</div>
              <div class="info-item"><strong>Dealer Code:</strong> ${val(
                alarmData.dealerCode
              )}</div>
              <div class="info-item full-width"><strong>Subscriber Name:</strong> ${val(
                alarmData.subscriberName
              )}</div>
              <div class="info-item full-width"><strong>Installation Address:</strong> ${val(
                alarmData.installationAddress
              )}</div>
              <div class="info-item"><strong>City:</strong> ${val(
                alarmData.city
              )}</div>
              <div class="info-item"><strong>State:</strong> ${val(
                alarmData.state
              )}</div>
              <div class="info-item"><strong>Zip:</strong> ${val(
                alarmData.zip
              )}</div>
               <div class="info-item"><strong>Start Date:</strong> ${formatDate(
                 alarmData.startDate
               )}</div>
                <div class="info-item "><strong>Monitor:</strong> ${val(
                  alarmData.monitor
                )}</div>
                 <div class="info-item "><strong>Ticket:</strong> ${val(
                   alarmData.ticket
                 )}</div>
          </div>

          <table>
              <thead>
                  <tr>
                      <th rowspan="2">Partition / Area #</th>
                      <th rowspan="2">Zone #</th>
                      <th rowspan="2">Code Description</th>
                      <th rowspan="2">Zone Description</th>
                      <th colspan="4" class="instructions-header">Instructions (Use Initials Below)</th>
                  </tr>
                  <tr>
                      <th>1st</th>
                      <th>2nd</th>
                      <th>3rd</th>
                      <th>4th</th>
                  </tr>
              </thead>
              <tbody>
                  ${communicatorRows}
              </tbody>
          </table>

          <div class="verification-box">
              <h3>Partition/Area Descriptions (Complete an SIS for Each Partition)</h3>
              <div class="verification-list">
                  <p><strong>VN</strong> - Verification</p>
                  <p><strong>NA</strong> - Numbers Notify Authorities</p>
                  <p><strong>NC</strong> - Notify Contact</p>
                  <p><strong>ND</strong> - Notify Dealer</p>
                  <p><strong>NG</strong> - Notify Guard</p>
              </div>
          </div>

          <div class="footer">
              <div>ALARM MONITORING SERVICES, INC.</div>
              <div style="text-align: right;"><strong>DEALER:</strong> ${val(
                alarmData.dealer
              )}</div>
          </div>
           <div class="footer">
              <div class="footer-item"><strong>BY:</strong> ${val(
                alarmData.createdBy?.username
              )}</div>
              <div class="footer-item"></div>
          </div>
      </div>
  </body>
  </html>
  `;

  return htmlContent;
};