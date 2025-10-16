import express from "express";
import { auth } from "#middlewares/auth.js";

import {
  createUndergroundTest,
  getUndergroundTests,
  getUndergroundTestById,
  updateUndergroundTest,
  deleteUndergroundTest,
} from "#controllers/admin/underground.controller.js";

const router = express.Router();

router.use(auth(["admin"]));

router.route("/").post(createUndergroundTest).get(getUndergroundTests);

router
  .route("/:id")
  .get(getUndergroundTestById)
  .patch(updateUndergroundTest)
  .delete(deleteUndergroundTest);

export default router;
