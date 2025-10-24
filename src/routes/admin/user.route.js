import express from "express";
import { auth } from "#middlewares/auth.js";
import validate from "#middlewares/validate.js";

import userValidation from "#validations/user.validations.js";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "#controllers/admin/user.controller.js";

const router = express.Router();

router.use(auth(["admin",'manager']));

router
  .route("/")
  .post(validate(userValidation.createUser), createUser)
  .get(getUsers);

router
  .route("/:id")
  .get(validate(userValidation.getUser), getUserById)
  .patch(validate(userValidation.updateUser), updateUser)
  .delete(validate(userValidation.deleteUser), deleteUser);

export default router;
