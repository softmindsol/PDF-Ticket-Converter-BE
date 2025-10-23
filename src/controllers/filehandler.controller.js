import { asyncHandler, ApiResponse, ApiError } from "#utils/api.utils.js";
import httpStatus from "http-status";
import s3Client from "../config/aws.config.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const uploadFileController = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No file was uploaded.");
  }

  const fileInfo = {
    url: req.file.location,
    key: req.file.key,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  };

  return new ApiResponse(
    res,
    httpStatus.OK,
    { file: fileInfo },
    "File uploaded successfully to S3."
  );
});

/**
 * @desc    Generate a presigned URL for downloading/viewing a private S3 object.
 * @route   GET /api/s3/get-signed-url
 * @access  Private
 */
 const getPresignedUrlController = asyncHandler(async (req, res) => {
  // 1. Receive the full URL from the request query.
  const { key: fullUrl } = req.query;

  if (!fullUrl) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'The "key" (containing the full URL) query parameter is required.');
  }

  let s3Key;
  try {
    // 2. Use the standard URL parser to safely deconstruct the URL.
    const url = new URL(fullUrl);
    
    // 3. Extract the pathname (e.g., "/customers/file.pdf") and remove the leading slash.
    // The result is the S3 Key (e.g., "customers/file.pdf").
    s3Key = url.pathname.slice(1);

  } catch (error) {
    // This will catch invalid URLs.
    throw new ApiError(httpStatus.BAD_REQUEST, "The provided key is not a valid URL.");
  }

  const bucketName = process.env.S3_BUCKET_NAME;

  // 4. Use the EXTRACTED key in the S3 command.
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    return new ApiResponse(
      res,
      httpStatus.OK,
      { url: signedUrl },
      "Signed URL generated successfully."
    );
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      throw new ApiError(httpStatus.NOT_FOUND, 'The requested file does not exist in S3.');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not generate the file URL.');
  }
});

/**
 * @desc    Delete an object from the S3 bucket.
 * @route   DELETE /api/s3/delete-object
 * @access  Private
 */
const deleteS3ObjectController = asyncHandler(async (req, res) => {
  const { key } = req.body;

  if (!key) {
    throw new ApiError(httpStatus.BAD_REQUEST, "S3 object key is required.");
  }

  const bucketName = process.env.S3_BUCKET_NAME;

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    await s3Client.send(command);

    return new ApiResponse(
      res,
      httpStatus.OK,
      null,
      "File deleted successfully from S3."
    );
  } catch (error) {
    console.error("Error deleting object from S3:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not delete the file."
    );
  }
});

export {
  uploadFileController,
  getPresignedUrlController,
  deleteS3ObjectController,
};
