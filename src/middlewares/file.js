import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "#utils/api.utils.js";
import httpStatus from "http-status";

export const handleFileUpload = (folderName, fieldName, isMultiple = false) => {
  const destinationDir = path.join(process.cwd(), "public", folderName);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(destinationDir, { recursive: true });
      cb(null, destinationDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = path.extname(file.originalname);
      cb(null, fieldName + "-" + uniqueSuffix + fileExtension);
    },
  });

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
          "Invalid file type. Only images and PDFs are allowed."
        ),
        false
      );
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
  });

  return (req, res, next) => {
    const uploader = isMultiple
      ? upload.array(fieldName)
      : upload.single(fieldName);

    uploader(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new ApiError(httpStatus.BAD_REQUEST, "File is too large (Max 5MB).")
          );
        }
        return next(new ApiError(httpStatus.BAD_REQUEST, err.message));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};
