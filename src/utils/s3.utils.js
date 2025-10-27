import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import httpStatus from "http-status";
import ApiError from "./api.utils.js";
import s3Client from "../config/aws.config.js";

/**
 * Generates a presigned URL for a given S3 object URL.
 * @param {string} fullUrl - The complete public or S3 URI of the object.
 * @param {number} expiresIn - The duration in seconds for which the signed URL is valid. Defaults to 600 (10 minutes).
 * @returns {Promise<string>} A promise that resolves to the signed URL.
 * @throws {ApiError} Throws an error if the URL is invalid, the object is not found, or another S3 error occurs.
 */
export const generateSignedS3Url = async (fullUrl, expiresIn = 600) => {
  if (!fullUrl) {
    throw new ApiError(httpStatus.BAD_REQUEST, "A URL must be provided.");
  }

  let s3Key;
  try {
    const url = new URL(fullUrl);
    // Extract the pathname and remove the leading slash to get the S3 key
    s3Key = url.pathname.slice(1);
  } catch (error) {
    // Catch cases where the provided string is not a valid URL
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "The provided key is not a valid URL."
    );
  }

  const bucketName = process.env.S3_BUCKET_NAME;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    // Handle specific S3 errors for better client feedback
    if (error.name === "NoSuchKey") {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "The requested file does not exist."
      );
    }
    // Handle other potential AWS errors
    console.error("S3 signing error:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not generate the file URL."
    );
  }
};