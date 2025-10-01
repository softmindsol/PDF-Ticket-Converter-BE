import express from "express";
import { auth } from "#middlewares/auth.js";
import validate from "#middlewares/validate.js";
import {
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getForms,
} from "#controllers/admin/department.controller.js";
import departmentValidation from "#validations/department.validations.js";

const router = express.Router();

router.use(auth(["admin"]));

router.route("/").get(getDepartments);

router.get("/forms", getForms);
router
  .route("/:id")
  .get(validate(departmentValidation.getDepartment), getDepartmentById)
  .patch(validate(departmentValidation.updateDepartment), updateDepartment)
  .delete(validate(departmentValidation.deleteDepartment), deleteDepartment);
export default router;
