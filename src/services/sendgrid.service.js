import sgMail from "@sendgrid/mail";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import { URL } from "url";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function sendEmailWithS3Attachment(
  recipients,
  subject,
  htmlContent,
  s3FileUrl
) {
  let s3Key;
  try {
    const url = new URL(s3FileUrl);

    s3Key = url.pathname.slice(1);

    if (!s3Key) {
      throw new Error("Could not extract a valid file key from the URL.");
    }
    console.log(`Extracted S3 key: ${s3Key}`);

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
    });
    const s3Response = await s3Client.send(command);

    const fileData = await s3Response.Body.transformToByteArray();
    const fileBuffer = Buffer.from(fileData);

    const encodedFile = fileBuffer.toString("base64");

    const msg = {
      to: recipients,
      from: { email: process.env.FROM_EMAIL, name: process.env.SENDER_NAME },
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          content: encodedFile,
          filename: path.basename(s3Key),
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    };

    await sgMail.send(msg);

    console.log(
      `Email with S3 attachment sent successfully to: ${recipients.join(", ")}`
    );
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.error("Error in sendEmailWithS3Attachment:", error);

    if (error.name === "NoSuchKey") {
      return {
        success: false,
        message: `File not found in S3 with key: ${s3Key}`,
      };
    }
    if (error.response) {
      console.error(error.response.body);
    }

    return {
      success: false,
      message: "Failed to send email.",
      error: error.message,
    };
  }
}
