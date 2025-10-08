import express from "express";
import { auth } from "#middlewares/auth.js";

import {
  createAboveGroundTest,
  getAboveGroundTests,
  getAboveGroundTestById,
  updateAboveGroundTest,
  deleteAboveGroundTest,
} from "#controllers/admin/AboveGroundTest.controller.js";

const router = express.Router();

router.use(auth(["admin"]));

router.route("/").post(createAboveGroundTest).get(getAboveGroundTests);

router
  .route("/:id")
  .get(getAboveGroundTestById)
  .patch(updateAboveGroundTest)
  .delete(deleteAboveGroundTest);

export default router;
