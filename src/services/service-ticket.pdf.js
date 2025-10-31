import fs from "fs/promises";
import path from "path";
import { generateSignedS3Url } from "../utils/s3.utils.js";

/**
 * Generates a complete HTML string for a Service Ticket.
 * It populates the template with data from a service ticket object.
 *
 * @param {object} ticketData - The service ticket data object from your database.
 * @returns {Promise<string>} A promise that resolves with the complete HTML content.
 */
export const generateServiceTicketHtml = async (ticketData) => {
    let sign=null
    if (ticketData?.customerSignature) {
      sign = await generateSignedS3Url(
        ticketData?.customerSignature
      );
    }
  if (!ticketData || !ticketData._id) {
    throw new Error(
      "A valid service ticket object with an _id must be provided."
    );
  }

  // --- 1. Load Logo and Set Up Helpers ---
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

  // --- 2. Prepare Data for the Table (REVISED DYNAMIC LOGIC) ---
  const maxTechRows = 6;
  const minMaterialRows = 21; // Set the minimum number of material rows

  // Dynamically determine the total rows needed. It will be at least minMaterialRows,
  // but will grow if the number of materials exceeds the minimum.
  const totalMaterialRows = Math.max(
    minMaterialRows,
    ticketData.materials.length
  );

  // Build the top 6 rows for Technician and initial materials
  let topTableRows = "";
  for (let i = 0; i < maxTechRows; i++) {
    const techName = i === 0 ? val(ticketData.technicianName) : "";
    const st = i === 0 ? val(ticketData.stHours) : "";
    const ot = i === 0 ? val(ticketData.otHours) : "";
    const materialItem = ticketData.materials[i];

    topTableRows += `
      <tr>
          <td>${techName}</td>
          <td>${st}</td>
          <td>${ot}</td>
          <td>${materialItem ? val(materialItem.quantity) : ""}</td>
          <td>${materialItem ? val(materialItem.material) : ""}</td>
      </tr>`;
  }

  // Build the bottom section combining Work Description and remaining materials
  let bottomTableRows = "";
  const remainingRowsCount = Math.max(0, totalMaterialRows - maxTechRows);

  if (remainingRowsCount > 0) {
    // Loop through the remaining material slots
    for (let i = 0; i < remainingRowsCount; i++) {
      const materialIndex = i + maxTechRows;
      const materialItem = ticketData.materials[materialIndex];

      if (i === 0) {
        // The first row contains the Work Description cell with a dynamic rowspan
        bottomTableRows += `
          <tr>
              <td colspan="3" rowspan="${remainingRowsCount}" style="padding: 10px; vertical-align: top;">
                  <strong>Work Description:</strong>
                  <p style="white-space: pre-wrap; margin-top: 5px;">${val(
                    ticketData.workDescription
                  )}</p>
              </td>
              <td>${materialItem ? val(materialItem.quantity) : ""}</td>
              <td>${materialItem ? val(materialItem.material) : ""}</td>
          </tr>
        `;
      } else {
        // Subsequent rows only contain the material quantity and description
        bottomTableRows += `
          <tr>
              <td>${materialItem ? val(materialItem.quantity) : ""}</td>
              <td>${materialItem ? val(materialItem.material) : ""}</td>
          </tr>
        `;
      }
    }
  } else {
    // Fallback if there are 0 remaining rows, just show the Work Description
    bottomTableRows = `
      <tr>
          <td colspan="5" style="padding: 10px; vertical-align: top;">
              <strong>Work Description:</strong>
              <p style="white-space: pre-wrap; margin-top: 5px;">${val(
                ticketData.workDescription
              )}</p>
          </td>
      </tr>
    `;
  }

  // --- 3. Assemble the Final HTML Template ---
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Service Ticket - ${val(ticketData._id)}</title>
        <style>
            body { font-family: Arial, sans-serif; font-size: 10pt; }
            .container { width: 8.5in; min-height: 11in; padding: 0.5in; margin: auto; background-color: #fff; box-sizing: border-box; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px; }
            .logo-container img { width: 200px; height: auto; }
            .address-group { display: flex; gap: 20px; font-size: 9pt; }
            .address-group .location p { margin: 0; }
            .service-info { display: flex; justify-content: space-between; font-weight: bold; padding: 5px 0; margin-bottom: 15px; }
            .job-details { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 9.5pt; }
            .data-field { display: flex; align-items: flex-end; margin-bottom: 4px; }
            .data-field strong { padding-right: 8px; white-space: nowrap; }
            .data-field span { flex-grow: 1; border-bottom: 1px solid #000; display: inline-block; min-height: 1.2em; padding: 0 2px; }
            .main-table { width: 100%; border-collapse: collapse; }
            .main-table th, .main-table td { border: 1px solid #000; padding: 5px; vertical-align: top; height: 22px; }
            .main-table th { font-weight: bold; text-align: center; }
            .tech-col { width: 30%; } .st-col, .ot-col, .qty-col { width: 8%; } .material-col { width: 46%; }
            .acceptance-section { margin-top: 20px; text-align: center; font-size: 11pt; }
            .acceptance-title { font-weight: bold; font-size: 14pt; text-decoration: underline; }
            .acceptance-text { text-align: left; margin-top: 10px; line-height: 1.6; }
            .acceptance-item { display: flex; align-items: center; margin-bottom: 5px; }
            .acceptance-item p { margin: 0; }
            .check-line {
                display: inline-block;
                width: 40px;
                border-bottom: 1.5px solid #000;
                margin-right: 10px;
                text-align: center;
                font-weight: bold;
                font-size: 16pt;
                line-height: 1;
            }
            .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
        </style>
    </head>
    <body>
    <div class="container">
        <header class="header">
            <div class="logo-container">
                ${
                  logoDataUri
                    ? `<img src="${logoDataUri}" alt="Southern Fire Logo">`
                    : "<h1>SOUTHERN FIRE</h1>"
                }
            </div>
            <div class="address-group">
                 <div class="location"><p><strong>Hattiesburg</strong></p><p>77 Richburg Road</p><p>Purvis, MS 39475</p><p>P: 601.264.9729</p><p>F: 601.264.9730</p></div>
                 <div class="location"><p><strong>Gulf Coast</strong></p><p>10970 Old Hwy 67</p><p>D'Iberville, MS 39540</p><p>P: 228.392.2000</p></div>
                 <div class="location"><p><strong>Mobile</strong></p><p>7930 Moffett Rd,</p><p>Suite H</p><p>Semmes, AL 36575</p><p>P: 251.679.0864</p></div>
            </div>
        </header>

        <div class="service-info">
            <span>24 Hour Emergency Service</span>
            <span>4 Hour Minimum on Service Calls</span>
            <span>Total Fire Protection Packages</span>
        </div>

        <main>
            <div class="job-details">
                <div class="column" style="width: 48%;">
                    <div class="data-field"><strong>Job Name:</strong><span>${val(
                      ticketData.jobName
                    )}</span></div>
                    <div class="data-field"><strong>Location:</strong><span>${val(
                      ticketData.jobLocation
                    )}</span></div>
                    <div class="data-field"><strong>Date:</strong><span>${formatDate(
                      ticketData.completionDate
                    )}</span></div>
                    <div class="data-field"><strong>SF Job Number:</strong><span>${val(
                      ticketData._id
                    )}</span></div>
                </div>
                <div class="column" style="width: 48%;">
                    <div class="data-field"><strong>Work Order/PO:</strong><span></span></div>
                    <div class="data-field"><strong>Contact Name:</strong><span>${val(
                      ticketData.customerName
                    )}</span></div>
                    <div class="data-field"><strong>Contacts Number:</strong><span>${val(
                      ticketData.phoneNumber
                    )}</span></div>
                </div>
            </div>

            <table class="main-table">
                <thead>
                    <tr>
                        <th class="tech-col">Technician Name:</th><th class="st-col">ST Hours:</th><th class="ot-col">OT Hours:</th><th class="qty-col">QTY:</th><th class="material-col">Material List:</th>
                    </tr>
                </thead>
                <tbody>
                    ${topTableRows}
                    ${bottomTableRows}
                </tbody>
            </table>

            <div class="acceptance-section">
                <div class="acceptance-title">Buyers Verification & Acceptance:</div>
                 <div class="acceptance-text">
                    <div class="acceptance-item">
                        <span class="check-line">${
                          ticketData.workOrderStatus === "Not Complete"
                            ? "&#10003;"
                            : "&nbsp;"
                        }</span>
                        <p><strong>Work Order – Not complete</strong> – Buyer's signature is for verification of labor and material listed above.</p>
                    </div>
                    <div class="acceptance-item">
                        <span class="check-line">${
                          ticketData.workOrderStatus === "System Out of Order"
                            ? "&#10003;"
                            : "&nbsp;"
                        }</span>
                        <p><strong>System Out of Service</strong> – Buyer's signature acknowledges their awareness that the life safety system is currently out of service.</p>
                    </div>
                    <div class="acceptance-item">
                       <span class="check-line">${
                         ticketData.workOrderStatus === "Complete"
                           ? "&#10003;"
                           : "&nbsp;"
                       }</span>
                        <p><strong>Work Order – Complete</strong> – The buyer's signature serves as verification of the labor and materials detailed above...</p>
                    </div>
                    <div class="acceptance-item">
                       <span class="check-line">${
                         ticketData.applySalesTax ? "&#10003;" : "&nbsp;"
                       }</span>
                        <p><strong>Apply Sales Tax</strong></p>
                    </div>
                </div>
            </div>
        </main>

       <footer>
                <div class="signature-section">
                   <div class="data-field" style="width: 60%;">
                      <strong>Signature:</strong>
                      <span>${
                        sign
                          ? `<img src="${sign}" style="height: 170px; width: 170px; margin-bottom: -30px; display: block;"/>` // Adjusted style
                          : ""
                      }</span>
                  </div>
                    <div class="data-field" style="width: 35%;">
                        <strong>Date:</strong><span>${formatDate(
                          ticketData.completionDate
                        )}</span>
                    </div>
                </div>
                <div class="signature-section" style="margin-top: 15px;">
                    <div class="data-field" style="width: 100%;">
                        <strong>Print Name:</strong><span>${val(
                          ticketData.customerName
                        )}</span>
                    </div>
                </div>
            </footer>
    </div>
    </body>
    </html>
  `;
};
