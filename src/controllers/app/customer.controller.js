import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import Customer from "#models/customer.model.js";
import { generateCustomerProfileHtml } from "#root/src/services/customer.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";

const createCustomer = asyncHandler(async (req, res) => {
  const {
    customerName,
  } = req.body;

  // Check if a customer with the same name already exists
  const existingCustomer = await Customer.findOne({ customerName });
  if (existingCustomer) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A customer with this name already exists.",
      [{ customerName: "Customer name is already taken" }]
    );
  }

  // Create the new customer record
  const newCustomer = await Customer.create({
    ...req.body,
    createdBy: req.user._id,
  });

  try {
    // Generate HTML for the customer profile PDF
    const html = await generateCustomerProfileHtml(newCustomer);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newCustomer._id}-${safeTimestamp}.pdf`;

    // Save the HTML as a PDF file
    const pdfData = await savePdfToFile(html, newFileName, "customers");
    console.log("🚀 ~ PDF Data:", pdfData);

    // Assign the generated PDF's URL to the customer's ticket field
    newCustomer.ticket = pdfData?.url;

    // Save the updated customer with the PDF URL
    const updatedCustomer = await newCustomer.save();

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      { customer: updatedCustomer },
      "Customer and PDF profile created successfully."
    );
  } catch (pdfError) {
    // Log the error if PDF generation fails
    console.error("Failed to generate PDF for customer:", pdfError);

    // Return a success response for customer creation, but with a warning
    return new ApiResponse(
      res,
      httpStatus.CREATED,
      {
        customer: newCustomer,
        warning:
          "Customer was created, but failed to generate the PDF profile.",
      },
      "Customer created without a PDF profile."
    );
  }
});

export { createCustomer };