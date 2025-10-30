import Joi from "joi";

const passwordRegrex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{6,30}$/;

const authValidation = {
  login: {
    body: Joi.object({
      username: Joi.string()
        .trim() // 1. Trims whitespace from the beginning and end
        .min(3)
        .max(50) // 2. Updated max length to 50
        .pattern(/^[a-zA-Z0-9._-]+$/) // 3. The exact regex from Yup
        .required()
        .messages({
          "string.base": "Username must be a string.",
          "string.empty": "Please enter a username.",
          "any.required": "Please enter a username.",
          "string.min": "Username must be at least 3 characters.",
          "string.max": "Username must not exceed 50 characters.",
          "string.pattern.base":
            "Username can only contain letters, numbers, dots, hyphens, and underscores.",
        }),
      password: Joi.string().required().regex(passwordRegrex).messages({
        "string.base": "Password must be a string",
        "string.empty": "Password cannot be empty",
        "string.pattern.base":
          "Password must contain at least one lowercase letter, one uppercase letter, and one special character",
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password cannot be longer than 30 characters",
        "any.required": "Password is required",
      }),
    }),
  },
  register: {
    body: Joi.object({
      username: Joi.string()
        .trim() // 1. Trims whitespace from the beginning and end
        .min(3)
        .max(50) // 2. Updated max length to 50
        .pattern(/^[a-zA-Z0-9._-]+$/) // 3. The exact regex from Yup
        .required()
        .messages({
          "string.base": "Username must be a string.",
          "string.empty": "Please enter a username.",
          "any.required": "Please enter a username.",
          "string.min": "Username must be at least 3 characters.",
          "string.max": "Username must not exceed 50 characters.",
          "string.pattern.base":
            "Username can only contain letters, numbers, dots, hyphens, and underscores.",
        }),
      password: Joi.string().required().regex(passwordRegrex).messages({
        "string.base": "Password must be a string",
        "string.empty": "Password cannot be empty",
        "string.pattern.base":
          "Password must contain at least one lowercase letter, one uppercase letter, and one special character",
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password cannot be longer than 30 characters",
        "any.required": "Password is required",
      }),

      firstName: Joi.string().required().min(3).max(30).messages({
        "string.base": "First name must be a string",
        "string.empty": "First name cannot be empty",
        "string.min": "First name must be at least 3 characters long",
        "string.max": "First name cannot be longer than 30 characters",
        "any.required": "First name is required",
      }),
      lastName: Joi.string().required().min(3).max(30).messages({
        "string.base": "Last name must be a string",
        "string.empty": "Last name cannot be empty",
        "string.min": "Last name must be at least 3 characters long",
        "string.max": "Last name cannot be longer than 30 characters",
        "any.required": "Last name is required",
      }),
      phoneNumber: Joi.string().required().min(10).max(15).messages({
        "string.base": "Phone number must be a string",
        "string.empty": "Phone number cannot be empty",
        "string.min": "Phone number must be at least 10 characters long",
        "string.max": "Phone number cannot be longer than 15 characters",
        "any.required": "Phone number is required",
      }),
    }),
  },

  changePassword: {
    body: Joi.object({
      oldPassword: Joi.string().required().messages({
        "string.base": "Current password must be a string",
        "string.empty": "Current password cannot be empty",
        "any.required": "Current password is required",
      }),
      newPassword: Joi.string()
        .required()
        .regex(passwordRegrex)
        .min(6)
        .max(30)
        .not(Joi.ref("oldPassword")) // Ensure new password is not the same as the old one
        .messages({
          "string.base": "New password must be a string",
          "string.empty": "New password cannot be empty",
          "string.pattern.base":
            "Password must be 6-30 characters and include an uppercase letter, a lowercase letter, a number, and a special character.",
          "string.min": "New password must be at least 6 characters long",
          "string.max": "New password cannot be longer than 30 characters",
          "any.required": "New password is required",
          "any.invalid":
            "New password must be different from the current password",
        }),
      confirmPassword: Joi.string()
        .required()
        .valid(Joi.ref("newPassword")) // Ensure it matches the new password
        .messages({
          "string.base": "Confirm password must be a string",
          "string.empty": "Confirm password cannot be empty",
          "any.required": "You must confirm your new password",
          "any.only": "Passwords do not match",
        }),
    }),
  },

  // ----------------- Change Username Validation -----------------
  changeUsername: {
    body: Joi.object({
      newUsername: Joi.string()
        .trim() // 1. Trims whitespace from the beginning and end
        .min(3)
        .max(50) // 2. Updated max length to 50
        .pattern(/^[a-zA-Z0-9._-]+$/) // 3. The exact regex from Yup
        .required()
        .messages({
          "string.base": "Username must be a string.",
          "string.empty": "Please enter a username.",
          "any.required": "Please enter a username.",
          "string.min": "Username must be at least 3 characters.",
          "string.max": "Username must not exceed 50 characters.",
          "string.pattern.base":
            "Username can only contain letters, numbers, dots, hyphens, and underscores.",
        }),
      password: Joi.string().required().messages({
        "string.base": "Password must be a string",
        "string.empty": "Password cannot be empty",
        "any.required": "Your current password is required to make this change",
      }),
    }),
  },
};

export default authValidation;
