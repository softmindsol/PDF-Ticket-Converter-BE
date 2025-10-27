// In #utils/workOrderHtmlGenerator.js

import fs from "fs/promises";
import path from "path";
import { generateSignedS3Url } from "../utils/s3.utils";

/**
 * Generates a complete HTML string for a work order/invoice.
 * It populates the template with data from a work order object.
 *
 * @param {object} workOrderData - The work order data object from your Mongoose schema.
 * @returns {Promise<string>} A promise that resolves with the complete HTML content.
 */
export const generateWorkOrderHtml = async (workOrderData) => {
  if (workOrderData?.customerSignature) {
    workOrderData.customerSignature = await generateSignedS3Url(
      workOrderData?.customerSignature
    );
  }
  if (!workOrderData || !workOrderData.materialList) {
    throw new Error(
      "A valid work order object with a material list must be provided."
    );
  }

  // --- 1. Load Logo and Set Up Helpers ---
  let logoDataUri = "";
  try {
    const logoPath = path.join(process.cwd(), "public", "southLogoFull.svg");
    const logoFile = await fs.readFile(logoPath, "base64");
    logoDataUri = `data:image/svg+xml;base64,${logoFile}`;
  } catch (error) {
    console.warn("Logo file not found. Proceeding without logo.");
  }

  const val = (field) => field || "&nbsp;";
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "&nbsp;";
  const formatCurrency = (num) =>
    typeof num === "number" ? `$${num.toFixed(2)}` : "&nbsp;";

  // --- 2. Process Material List and Calculate Totals ---
  let subtotal = 0;
  let totalTax = 0;

  const materialRows = workOrderData.materialList
    .map((item) => {
      const itemTotal = item.quantity * item.unitCost;
      const itemTax = itemTotal * (item.taxRate / 100);
      subtotal += itemTotal;
      totalTax += itemTax;

      return `
      <tr>
        <td>${val(item.quantity)}</td>
        <td>${val(item.description)}</td>
        <td>${formatCurrency(item.unitCost)}</td>
        <td>${formatCurrency(itemTotal)}</td>
      </tr>
    `;
    })
    .join("");

  const grandTotal = subtotal + totalTax;

  // --- 3. Generate Empty Rows to Fill the Table ---
  let emptyRows = "";
  // Adjust rows to fill based on a smaller table to accommodate totals
  const rowsToFill = 8 - workOrderData.materialList.length;
  if (rowsToFill > 0) {
    for (let i = 0; i < rowsToFill; i++) {
      emptyRows += "<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>";
    }
  }

  // --- 4. Assemble the Final HTML Template ---
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Work Order: ${val(workOrderData.jobNumber)}</title>
        <style>
            body { font-family: Arial, sans-serif; font-size: 10pt; color: #333; }
            .invoice-container { max-width: 8.5in; margin: auto; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
            .logo-container { flex: 1 1 30%; max-width: 280px; }
            .logo-container img { width: 100%; height: auto; }
            .contact-info { display: flex; flex: 1 1 65%; justify-content: flex-end; gap: 20px; text-align: left; font-size: 8pt; }
            .contact-info p { margin: 0; }
            .details-section { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .details-section .column { width: 48%; }
            .data-field { display: flex; align-items: baseline; margin-bottom: 5px; }
            .data-field strong { white-space: nowrap; padding-right: 8px; }
            .data-field span { border-bottom: 1px dotted #888; width: 100%; display: block; }
            .payment-options { display: flex; gap: 15px; align-items: center; }
            .items-table { width: 100%; border-collapse: collapse; }
            .items-table th, .items-table td { border: 1px solid #000; padding: 6px; }
            .items-table th { background-color: #f2f2f2; }
            
            /* --- TOTALS SECTION CSS CHANGES --- */
            .items-table .totals-row .totals-label {
                text-align: right;
                font-weight: bold;
                border: 1px solid #000;
            }
            .items-table .totals-row .no-border {
                border: none;
            }
            /* --- END OF CSS CHANGES --- */

            .signature-section { page-break-inside: avoid; margin-top: 40px; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
            .signature-box { width: 60%; }
            .signature-box .line { border-bottom: 1px solid #000; height: 30px; }
            .date-box { width: 30%; }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <header class="header">
                 <div class="logo-container">
                    ${
                      logoDataUri
                        ? `<img src="${logoDataUri}" alt="Southern Fire Logo">`
                        : "<h1>SOUTHERN FIRE</h1>"
                    }
                </div>
                <div class="contact-info">
                    <div class="location"><p><strong>Hattiesburg</strong><br>77 Richburg Road<br>Purvis, MS 39475<br>P: 601.264.9729</p></div>
                    <div class="location"><p><strong>Gulf Coast</strong><br>10970 Old Hwy 67<br>D'Iberville, MS 39540<br>P: 228.392.2000</p></div>
                    <div class="location"><p><strong>Mobile</strong><br>7930 Moffett Rd, Suite H<br>Semmes, AL 36575<br>P: 251.679.0864</p></div>
                </div>
            </header>

            <section class="details-section">
                <div class="column">
                    <div class="data-field"><strong>Customer Name:</strong><span>${val(
                      workOrderData.customerName
                    )}</span></div>
                    <div class="data-field"><strong>Contact Name:</strong><span>${val(
                      workOrderData.customerName
                    )}</span></div>
                    <div class="data-field"><strong>Contact Number:</strong><span>${val(
                      workOrderData.contactNumber
                    )}</span></div>
                    <div class="data-field"><strong>Contact Email:</strong><span>${val(
                      workOrderData.emailAddress
                    )}</span></div>
                </div>
                <div class="column">
                    <div class="data-field"><strong>Job Number #:</strong><span>${val(
                      workOrderData.jobNumber
                    )}</span></div>
                    <div class="data-field"><strong>Technician:</strong><span>${val(
                      workOrderData.technicianName
                    )}</span></div>
                    <div class="payment-options">
                        <strong>Payment:</strong>
                        <label><input type="checkbox" ${
                          workOrderData.paymentMethod.toLowerCase() === "cash"
                            ? "checked"
                            : ""
                        } disabled> Cash</label>
                        <label><input type="checkbox" ${
                          workOrderData.paymentMethod.toLowerCase() === "credit"
                            ? "checked"
                            : ""
                        } disabled> Credit</label>
                        <label><input type="checkbox" ${
                          workOrderData.paymentMethod.toLowerCase() === "check"
                            ? "checked"
                            : ""
                        } disabled> Check</label>
                    </div>
                </div>
            </section>

            <table class="items-table">
                <thead><tr><th>Quantity</th><th>Description</th><th>Unit Cost</th><th>Total</th></tr></thead>
                <tbody>
                    ${materialRows}
                    ${emptyRows}

                    <!-- --- TOTALS SECTION HTML CHANGES --- -->
                    <tr class="totals-row">
                        <td colspan="2" class="no-border"></td>
                        <td class="totals-label">Subtotal:</td>
                        <td>${formatCurrency(subtotal)}</td>
                    </tr>
                    <tr class="totals-row">
                        <td colspan="2" class="no-border"></td>
                        <td class="totals-label">Tax:</td>
                        <td>${formatCurrency(totalTax)}</td>
                    </tr>
                    <tr class="totals-row">
                        <td colspan="2" class="no-border"></td>
                        <td class="totals-label">Total:</td>
                        <td>${formatCurrency(grandTotal)}</td>
                    </tr>
                    <!-- --- END OF HTML CHANGES --- -->
                </tbody>
            </table>

            <footer class="signature-section">
                <div class="signature-box">
                    ${
                      workOrderData.customerSignature
                        ? `<img src="${workOrderData.customerSignature}" style="max-height: 40px; width: auto;">`
                        : '<div class="line"></div>'
                    }
                    <strong>Customer Signature:</strong>
                </div>
                <div class="date-box data-field">
                    <strong>Date:</strong><span>${formatDate(
                      workOrderData.date
                    )}</span>
                </div>
            </footer>
        </div>
    </body>
    </html>
  `;
};
