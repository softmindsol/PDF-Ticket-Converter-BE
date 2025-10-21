import path from "path";
import fs from "fs/promises"; // <-- Import the file system promises API
import { asyncHandler, ApiResponse, ApiError } from "#utils/api.utils.js";
import httpStatus from "http-status";

/**
 * Controller to respond with the URLs of uploaded files.
 * This should be placed *after* the handleFileUpload middleware in a route.
 */
const uploadFileController = asyncHandler(async (req, res) => {
  // Check if any file was uploaded. The middleware handles the actual upload.
  if (!req.file && (!req.files || req.files.length === 0)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No file was uploaded.");
  }

  // Helper function to construct a full URL for a file
  const generateUrl = (file) => {
    // The file.path from multer is an absolute system path.
    // We need to find the path relative to the 'public' directory.
    const publicDir = path.resolve(process.cwd(), "public");
    const relativePath = path.relative(publicDir, file.path);

    // Normalize path for URL (use forward slashes)
    const urlPath = relativePath.replace(/\\/g, "/");

    return `${req.protocol}://${req.get("host")}/${urlPath}`;
  };

  // Handle multiple file uploads
  if (req.files && req.files.length > 0) {
    const filesInfo = req.files.map((file) => ({
      url: generateUrl(file),
      filename: file.filename, // Multer provides the final saved filename
      originalname: file.originalname, // The original name of the file
      mimetype: file.mimetype,
      size: file.size,
    }));

    return new ApiResponse(
      res,
      httpStatus.OK,
      { files: filesInfo },
      "Files uploaded successfully."
    );
  }

  // Handle single file upload
  if (req.file) {
    const fileInfo = {
      url: generateUrl(req.file),
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    };

    return new ApiResponse(
      res,
      httpStatus.OK,
      { file: fileInfo },
      "File uploaded successfully."
    );
  }
});

/**
 * Controller to delete a file from the public directory.
 */
const deleteFileController = asyncHandler(async (req, res) => {
  const { filePath } = req.body;

  if (!filePath) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File path is required.");
  }

  // --- Security Critical: Prevent Directory Traversal ---
  // 1. Define the base public directory.
  const publicDir = path.resolve(process.cwd(), "public");
  // 2. Create an absolute path to the file user wants to delete.
  const absoluteFilePath = path.join(publicDir, filePath);
  // 3. Check if the resolved absolute path is still within the public directory.
  if (!absoluteFilePath.startsWith(publicDir)) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Access denied. You cannot delete files outside of the intended directory."
    );
  }

  try {
    // Check if the file exists before attempting to delete.
    await fs.access(absoluteFilePath);
    // If it exists, delete the file.
    await fs.unlink(absoluteFilePath);

    return new ApiResponse(
      res,
      httpStatus.OK,
      null,
      "File deleted successfully."
    );
  } catch (error) {
    // If fs.access or fs.unlink throws an 'ENOENT' error, the file doesn't exist.
    if (error.code === "ENOENT") {
      throw new ApiError(httpStatus.NOT_FOUND, "File not found.");
    }
    // For any other system errors (e.g., permissions), let the global error handler manage it.
    throw error;
  }
});


// Export both controllers
export { uploadFileController, deleteFileController };