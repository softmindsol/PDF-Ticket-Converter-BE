import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import ApiError from "#utils/api.utils.js";
import httpStatus from "http-status";

// Initialize the S3 client once and reuse it.
// It automatically reads credentials from process.env.
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

/**
 * A map to get a file extension from a MIME type.
 * @type {Object.<string, string>}
 */
const mimeTypeToExtension = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
  "text/plain": ".txt",
};

/**
 * Uploads a Base64 encoded file (in Data URL format) to an S3 bucket.
 *
 * @param {string} base64DataUrl The Base64 string, expected in "data:[MIME_TYPE];base64,[DATA]" format.
 * @param {string} folderName The name of the folder within the S3 bucket to upload the file to.
 * @returns {Promise<string>} A promise that resolves to the public URL of the uploaded file.
 * @throws {ApiError} Throws an error if the Base64 format is invalid or if the upload fails.
 */
export const uploadBase64ToS3 = async (base64DataUrl, folderName) => {
  // 1. Validate and parse the Base64 Data URL
  const matches = base64DataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid Base64 format. Expected 'data:[MIME_TYPE];base64,[DATA]'."
    );
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const fileExtension = mimeTypeToExtension[mimeType];

  // Optional: Add validation for allowed MIME types
  if (!fileExtension) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid file type (${mimeType}).`
    );
  }

  // 2. Decode the Base64 string into a Buffer
  const fileBuffer = Buffer.from(base64Data, "base64");

  // 3. Create a unique filename for S3
  const bucketName = process.env.S3_BUCKET_NAME;
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const s3Key = `${folderName}/upload-${uniqueSuffix}${fileExtension}`;

  // 4. Create and send the command to S3
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer, // The file content
      ContentType: mimeType, // Set the correct MIME type for the file
      // ACL: 'public-read', // Uncomment if your bucket is not public by default and you need the file to be accessible
    });

    await s3Client.send(command);

    // 5. Construct and return the public URL
    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    return fileUrl;
  } catch (s3Error) {
    console.error("Error uploading Base64 file to S3:", s3Error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to upload file."
    );
  }
};