import httpStatus from "http-status";
import { ApiResponse, asyncHandler } from "#utils/api.utils.js";
import Alarm from "#models/alarmMonitor.model.js";
import User from "#models/user.model.js";
import { savePdfToFile } from "#root/src/config/puppeteer.config.js";
import { generateAlarmProfileHtml } from "#root/src/services/alarm.pdf.js";
import { sendEmailWithS3Attachment } from "#root/src/services/sendgrid.service.js";
import { uploadBase64ToS3 } from "#utils/base64.util.js";
import { CLIENT_URL } from "#root/src/config/env.config.js";

const createAlarm = asyncHandler(async (req, res) => {
  // Handle monitor signature if provided as Base64
  if (req.body?.monitorSign) {
    req.body.monitorSign = await uploadBase64ToS3(
      req.body.monitorSign,
      "signatures"
    );
  }

  // Handle dealer signature if provided as Base64
  if (req.body?.dealerSign) {
    req.body.dealerSign = await uploadBase64ToS3(
      req.body.dealerSign,
      "signatures"
    );
  }

  const newAlarm = await Alarm.create({
    ...req.body,
    createdBy: req.user._id,
  });

  try {
    const html = await generateAlarmProfileHtml(newAlarm);

    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const newFileName = `${newAlarm._id}-${safeTimestamp}.pdf`;

    const pdfData = await savePdfToFile(html, newFileName, "alarms");

    newAlarm.ticket = pdfData?.url;

    const updatedAlarm = await newAlarm.save();

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
          const subject = `New Alarm Created: #${
            updatedAlarm.accountNumber || updatedAlarm._id
          }`;

          const alarmUrl = `${CLIENT_URL}/alarm/${updatedAlarm._id}`;

          const htmlContent = `
            <p>Hello,</p>
            <p>A new Alarm has been created by <strong>${req.user.firstName} ${req.user.lastName}</strong>.</p>
            <p>You can view the alarm directly by clicking this link: <a href="${alarmUrl}">View Alarm</a>.</p>
            <p>The alarm PDF is also attached for your review.</p>
            <p>Thank you.</p>
          `;

          await sendEmailWithS3Attachment(
            managerEmails,
            subject,
            htmlContent,
            pdfData.url
          );
        }
      } catch (emailError) {
        console.error(
          "Failed to send manager notification email for new alarm, but the alarm was created successfully.",
          emailError
        );
      }
    }

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      { alarm: updatedAlarm },
      "Alarm and PDF created successfully."
    );
  } catch (pdfError) {
    console.error("Failed to generate PDF for alarm:", pdfError);

    return new ApiResponse(
      res,
      httpStatus.CREATED,
      {
        alarm: newAlarm,
        warning: "Alarm was created, but failed to generate the PDF.",
      },
      "Alarm created without a PDF."
    );
  }
});

export { createAlarm };