import httpStatus from "http-status";
import ApiError, { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import Customer from "#models/customer.model.js";
import User from "#models/user.model.js";
import { generateCustomerProfileHtml } from "#root/src/services/customer.pdf.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";
import { sendEmailWithS3Attachment } from "#root/src/services/sendgrid.service.js";
import { CLIENT_URL } from "#root/src/config/env.config.js"; // Imported CLIENT_URL

const createCustomer = asyncHandler(async (req, res) => {
  const { customerName } = req.body;

  const existingCustomer = await Customer.findOne({ customerName });
  if (existingCustomer) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A customer with this name already exists.",
      [{ customerName: "Customer name is already taken" }]
    );
  }

  const newCustomer = await Customer.create({
    ...req.body,
    createdBy: req.user._id,
  });

  try {
    const html = await generateCustomerProfileHtml(newCustomer);
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newCustomer._id}-${safeTimestamp}.pdf`;

    const pdfData = await savePdfToFile(html, newFileName, "customers");

    newCustomer.ticket = pdfData?.url;
    const updatedCustomer = await newCustomer.save();

    const managersExist = req.user?.department?.manager?.length >= 1;

    if (managersExist && pdfData?.url) {
      try {
        const managerIds = req.user.department.manager;

        const managers = await User.find({
          _id: { $in: managerIds },
        })
          .select("+email")
          .lean();

        const managerEmails = managers
          .map((manager) => manager.email)
          .filter(Boolean);

        if (managerEmails.length > 0) {
          const subject = `New Customer Profile Created: ${updatedCustomer.customerName}`;
          
          // Construct the direct link to the customer profile
          const customerUrl = `${CLIENT_URL}/customer/${updatedCustomer._id}`;

          const htmlContent = `
            <p>Hello,</p>
            <p>A new customer profile for <strong>${updatedCustomer.customerName}</strong> has been created by ${req.user.firstName} ${req.user.lastName}.</p>
            <p>You can view the profile directly here: <a href="${customerUrl}">View Customer Profile</a>.</p>
            <p>The customer's profile PDF is also attached for your review.</p>
            <p>Thank you.</p>
          `;

          sendEmailWithS3Attachment(
            managerEmails,
            subject,
            htmlContent,
            pdfData.url
          );
        }
      } catch (emailError) {
        console.error(
          "Failed to send manager notification email for new customer, but the customer was created successfully.",
          emailError
        );
      }
    }

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      { customer: updatedCustomer },
      "Customer and PDF profile created successfully."
    );
  } catch (pdfError) {
    console.error("Failed to generate PDF for customer:", pdfError);

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