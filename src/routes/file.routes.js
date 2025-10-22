import express from "express";
import { handleFileUpload } from "#middlewares/file.js";
import { auth } from "#middlewares/auth.js";
import {
  uploadFileController,
  deleteS3ObjectController,
  getPresignedUrlController,
} from "#controllers/filehandler.controller.js";

const router = express.Router();

router.post(
  "/signature",
  auth(["user", 'admin', 'manager' ]),
  handleFileUpload("signature", "signature"),
  uploadFileController
);
router.get(
  "/pre-sign",
  auth(["user", 'admin', 'manager' ]),
 getPresignedUrlController
);


router.delete("/delete-file", auth(["admin", "user"]), deleteS3ObjectController);

export default router;
