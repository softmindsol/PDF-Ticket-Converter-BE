import express from "express";
import { handleFileUpload } from "#middlewares/file.js";
import { auth } from "#middlewares/auth.js";
import {
  uploadFileController,
  deleteFileController,
} from "#controllers/filehandler.controller.js";

const router = express.Router();

router.post(
  "/signature",
  auth(["user", 'admin', 'manager' ]),
  handleFileUpload("signature", "signature"),
  uploadFileController
);


router.delete("/delete-file", auth(["admin", "user"]), deleteFileController);

export default router;
