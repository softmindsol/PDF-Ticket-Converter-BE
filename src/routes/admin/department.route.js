import express from "express";
import { auth } from "#middlewares/auth.js";
import validate from "#middlewares/validate.js";
import { createDepartment } from "#controllers/admin/department.controller.js";
import departmentValidation from "#validations/department.validations.js";
const router = express.Router();
router.use(auth(["admin"]));

router.post("/", validate(departmentValidation.createDepartment), createDepartment);



export default router;
