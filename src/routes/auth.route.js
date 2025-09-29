import express from "express";
import { loginController, registerController } from "#controllers/auth.controller.js";
import validate from "#middlewares/validate.js";
import authValidation from "#validations/auth.validations.js";
const router = express.Router();

router.post("/login",validate(authValidation.login), loginController);
router.post("/register",validate(authValidation.register), registerController);

export default router;



/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and registration
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Login:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           pattern: "^[a-z][a-z0-9]+$"
 *           minLength: 3
 *           maxLength: 30
 *           description: "Must start with a letter and can only contain lowercase letters and numbers."
 *           example: "johndoe"
 *         password:
 *           type: string
 *           pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W).{6,30}$"
 *           minLength: 6
 *           maxLength: 30
 *           description: "Must contain at least one lowercase letter, one uppercase letter, one number, and one special character."
 *           example: "Password123!"
 *     Register:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - firstName
 *         - lastName
 *         - phoneNumber
 *       properties:
 *         username:
 *           type: string
 *           pattern: "^[a-z][a-z0-9]+$"
 *           minLength: 3
 *           maxLength: 30
 *           description: "Must start with a letter and can only contain lowercase letters and numbers."
 *           example: "janedoe"
 *         password:
 *           type: string
 *           pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W).{6,30}$"
 *           minLength: 6
 *           maxLength: 30
 *           description: "Must contain at least one lowercase letter, one uppercase letter, one number, and one special character."
 *           example: "Password456@"
 *         firstName:
 *           type: string
 *           minLength: 3
 *           maxLength: 30
 *           example: "Jane"
 *         lastName:
 *           type: string
 *           minLength: 3
 *           maxLength: 30
 *           example: "Doe"
 *         phoneNumber:
 *           type: string
 *           minLength: 10
 *           maxLength: 15
 *           example: "1234567890"
 *   responses:
 *     UnauthorizedError:
 *       description: "Access token is missing or invalid"
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Unauthorized"
 *     ValidationError:
 *        description: "Validation error"
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Validation failed"
 *                errors:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      field:
 *                        type: string
 *                      message:
 *                        type: string
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       "200":
 *         description: "Successful login"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Register'
 *     responses:
 *       "201":
 *         description: "User created successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 */
