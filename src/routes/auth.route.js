import express from "express";
import { loginController, registerController } from "#controllers/auth.controller.js";
import validate from "#middlewares/validate.js";
import authValidation from "#validations/auth.validations.js";
const router = express.Router();

router.post("/login",validate(authValidation.login), loginController);
router.post("/register",validate(authValidation.register), registerController);

export default router;
