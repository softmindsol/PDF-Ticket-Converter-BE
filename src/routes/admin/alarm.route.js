import express from "express";
import { auth } from "#middlewares/auth.js";

import {
  createAlarm,
  getAlarms,
  getAlarmById,
  updateAlarm,
  deleteAlarm,
} from "#controllers/admin/alarm.controller.js";

const router = express.Router();

router.use(auth(["admin", "manager"]));

router.route("/").post(createAlarm).get(getAlarms);

router.route("/:id").get(getAlarmById).patch(updateAlarm).delete(deleteAlarm);

export default router;
