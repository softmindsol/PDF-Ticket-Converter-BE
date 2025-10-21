import express from "express";
import { handleFileUpload } from "#middlewares/file.js";
import { auth } from "#middlewares/auth.middleware.js";
import {
  uploadFileController,
  deleteFileController,
} from "#controllers/filehandler.controller.js";

const router = express.Router();

router.post(
  "/pdf",
  auth(["user"]),
  handleFileUpload("tickets", "ticket"),
  uploadFileController
);


router.delete("/delete-file", auth(["admin", "user"]), deleteFileController);

export default router;
