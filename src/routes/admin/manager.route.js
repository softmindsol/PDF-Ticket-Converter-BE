import express from "express";
import { auth } from "#middlewares/auth.js";
import validate from "#middlewares/validate.js";
import managerValidation from "#validations/manager.validations.js";
import { createManager } from "#controllers/admin/manager.controller.js";
const router = express.Router();
router.use(auth(["admin"]));

router.post("/", validate(managerValidation.createManager), createManager);



export default router;
