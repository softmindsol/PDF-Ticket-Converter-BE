import fs from "fs/promises";
import path from "path";

export const generateCustomerProfileHtml = async (customerData) => {
  if (!customerData || !customerData._id) {
    throw new Error("A valid customer object with an _id must be provided.");
  }

  let logoDataUri = "";
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.jpg");
    const logoFile = await fs.readFile(logoPath, "base64");
    logoDataUri = `data:image/jpeg;base64,${logoFile}`;
  } catch (error) {
    console.warn(
      "Logo file not found or could not be read. Proceeding without logo."
    );
  }

  const val = (field) => field || "&nbsp;";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Southern Fire Customer Information</title>
        <style>
            body { font-family: Arial, sans-serif; font-size: 10pt; color: #333; }
            .form-container { max-width: 800px; margin: auto; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; border-bottom: 1px solid #ccc; padding-bottom: 1rem; }
            .logo-container { flex: 1; }
            .logo-container img { width: 250px; height: auto; }
            .contact-info { display: flex; gap: 1.5rem; flex: 2; justify-content: flex-end; font-size: 8pt; }
            .location p { margin: 0; }
            .data-field { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dotted #ccc; padding: 6px 2px; margin-bottom: 4px; }
            .data-field strong { text-transform: uppercase; font-size: 9pt; color: #555; }
            .required-section { border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 1rem 0; margin: 2rem 0; }
            .section-header { font-weight: bold; font-size: 11pt; margin-bottom: 1rem; }
            .footer-note { font-size: 9pt; margin-top: 2rem; }
            
            /* Style for the checkboxes */
            .data-field input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: #333; /* Makes the checkmark dark */
            }
        </style>
    </head>
    <body>
        <div class="form-container">
            <div class="header">
                <div class="logo-container">
                    ${logoDataUri
      ? `<img src="${logoDataUri}" alt="Southern Fire Logo">`
      : "<h1>SOUTHERN FIRE</h1>"
    }
                </div>
                <div class="contact-info">
                    <!-- Contact info columns -->
                    <div class="location">
                        <p><strong>Hattiesburg</strong></p>
                        <p>77 Richburg Road</p><p>Purvis, MS 39475</p><p>P: 601.264.9729</p>
                    </div>
                    <div class="location">
                        <p><strong>Gulf Coast</strong></p>
                        <p>10970 Old Hwy 67</p><p>D'Iberville, MS 39540</p><p>P: 228.392.2000</p>
                    </div>
                    <div class="location">
                        <p><strong>Mobile</strong></p>
                        <p>7930 Moffett Rd, Suite H</p><p>Semmes, AL 36575</p><p>P: 251.679.0864</p>
                    </div>
                </div>
            </div>

            <!-- Customer and Site Information -->
            <div class="data-field"><strong>Building Name:</strong> <span>${val(
      customerData.buildingName
    )}</span></div>
            <div class="data-field"><strong>Customer Name:</strong> <span>${val(
      customerData.customerName
    )}</span></div>
            <div class="data-field"><strong>Customer Phone Number:</strong> <span>${val(
      customerData.phoneNumber
    )}</span></div>
            <div class="data-field"><strong>On-Site Contact:</strong> <span>${val(
      customerData.onSiteContactName
    )}</span></div>
            <div class="data-field"><strong>On-Site Phone Number:</strong> <span>${val(
      customerData.onSitePhoneNumber
    )}</span></div>
            <div class="data-field"><strong>On-Site Email Address:</strong> <span>${val(
      customerData.onSiteEmailAddress
    )}</span></div>
            <div class="data-field"><strong>Email for Inspection Reports:</strong> <span>${val(
      customerData.emailForInspectionReports
    )}</span></div>
            <div class="data-field"><strong>Type of Site:</strong> <span>${val(
      customerData.typeOfSite
    )}</span></div>
            <div class="data-field"><strong>Site Address:</strong> <span>${val(
      customerData.siteAddress
    )}</span></div>
            <div class="data-field"><strong>Billing Name:</strong> <span>${val(
      customerData.billingName
    )}</span></div>
            <div class="data-field"><strong>Billing Contact Number:</strong> <span>${val(
      customerData.billingContactNumber
    )}</span></div>
            <div class="data-field"><strong>Billing Email Address:</strong> <span>${val(
      customerData.billingEmailAddress
    )}</span></div>

            <div class="required-section">
                <p class="section-header">*****REQUIRED INFORMATION!*****</p>
                <div class="data-field"><strong>Owner's Name:</strong> <span>${val(
      customerData.ownerName
    )}</span></div>
                <div class="data-field"><strong>Owner's Phone Number:</strong> <span>${val(
      customerData.ownerContactNumber
    )}</span></div>
                <div class="data-field"><strong>Owner's Address:</strong> <span>${val(
      customerData.ownerAddress
    )}</span></div>
                <div class="data-field"><strong>Owner's Email:</strong> <span>${val(
      customerData.ownerEmailAddress
    )}</span></div>
            </div>

            <div>
    <p class="section-header">DO YOU HAVE A:</p>
    <div class="data-field">
        <strong>Tax Exempt Certificate:</strong>
        <span>
            ${customerData.taxExemptCertificate === 'Yes' ? 'Yes' :
      customerData.taxExemptCertificate === 'No' ? 'No' : 'N/A'
    }
        </span>
    </div>
    <div class="data-field">
        <strong>Direct Pay Certificate:</strong>
        <span>
            ${customerData.directPayCertificate === 'Yes' ? 'Yes' :
      customerData.directPayCertificate === 'No' ? 'No' : 'N/A'
    }
        </span>
    </div>
</div>

            <p class="footer-note"><strong>*PLEASE EMAIL A COPY OF THE CERTIFICATE ALONG WITH CUSTOMER PROFILE SHEET*</strong></p>
        </div>
    </body>
    </html>`;

  return htmlContent;
};