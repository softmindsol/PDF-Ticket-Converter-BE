import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import ApiError from "#utils/api.utils.js"; // Assuming you have this custom error class
import httpStatus from "http-status";

// 1. Initialize S3 Client (it will use credentials from .env automatically)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

// 2. Configure Multer to use memoryStorage
// This tells multer to keep the file as a buffer in memory, not save it to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid file type. Only images (jpeg, png, gif) and PDFs are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB file size limit
  },
});

// 3. The main middleware function
export const handleFileUpload = (folderName, fieldName) => {
  return (req, res, next) => {
    // First, use multer to process the file (extracts it from the form-data)
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        // Handle multer-specific errors
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return next(new ApiError(httpStatus.BAD_REQUEST, "File is too large (Max 5MB)."));
          }
          return next(new ApiError(httpStatus.BAD_REQUEST, err.message));
        }
        // Handle other errors (like the invalid file type from our filter)
        return next(err);
      }

      // If no file is uploaded, move to the next middleware
      if (!req.file) {
        return next();
      }

      // --- S3 Upload Logic ---
      try {
        const file = req.file;
        const bucketName = process.env.S3_BUCKET_NAME;

        // Create a unique filename for S3
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname);
        const s3FileName = `${folderName}/${fieldName}-${uniqueSuffix}${fileExtension}`;

        // Create the command to upload the file
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: s3FileName,
          Body: file.buffer, // The file data is in memory as a buffer
          ContentType: file.mimetype, // Set the correct content type
        });

        // Execute the upload command
        await s3Client.send(command);

        // Attach the S3 file location to the request object for the next handler
        req.file.location = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3FileName}`;

        next();
      } catch (s3Error) {
        console.error("Error uploading to S3:", s3Error);
        return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error uploading file to S3."));
      }
    });
  };
};


// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import ApiError from "#utils/api.utils.js";
// import httpStatus from "http-status";

// export const handleFileUpload = (folderName, fieldName, isMultiple = false) => {
//   const destinationDir = path.join(process.cwd(), "public", folderName);

//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       fs.mkdirSync(destinationDir, { recursive: true });
//       cb(null, destinationDir);
//     },
//     filename: (req, file, cb) => {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       const fileExtension = path.extname(file.originalname);
//       cb(null, fieldName + "-" + uniqueSuffix + fileExtension);
//     },
//   });

//   const fileFilter = (req, file, cb) => {
//     const allowedMimeTypes = [
//       "image/jpeg",
//       "image/png",
//       "image/gif",
//       "application/pdf",
//     ];
//     if (allowedMimeTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(
//         new ApiError(
//           httpStatus.BAD_REQUEST,
//           "Invalid file type. Only images and PDFs are allowed."
//         ),
//         false
//       );
//     }
//   };

//   const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: {
//       fileSize: 1024 * 1024 * 5,
//     },
//   });

//   return (req, res, next) => {
//     const uploader = isMultiple
//       ? upload.array(fieldName)
//       : upload.single(fieldName);

//     uploader(req, res, (err) => {
//       if (err instanceof multer.MulterError) {
//         if (err.code === "LIMIT_FILE_SIZE") {
//           return next(
//             new ApiError(httpStatus.BAD_REQUEST, "File is too large (Max 5MB).")
//           );
//         }
//         return next(new ApiError(httpStatus.BAD_REQUEST, err.message));
//       } else if (err) {
//         return next(err);
//       }
//       next();
//     });
//   };
// };



