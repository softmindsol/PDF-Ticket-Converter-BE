import Joi from "joi";

const passwordRegrex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{6,30}$/;
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const userValidation = {
  /**
   * Validation for POST /api/users
   */
  createUser: {
    body: Joi.object({
      username: Joi.string()
        .required()
        .regex(/^[a-z][a-z0-9]+$/)
        .min(3)
        .max(30)
        .messages({
          "string.base": "Username must be a string",
          "string.empty": "Username cannot be empty",
          "string.pattern.base":
            "Username must start with a letter and can only contain letters and numbers",
          "string.min": "Username must be at least 3 characters long",
          "string.max": "Username cannot be longer than 30 characters",
          "any.required": "Username is required",
        }),
      email: Joi.string().email().messages({
        "string.email": "Please provide a valid email address",
      }),
      password: Joi.string().required().regex(passwordRegrex).messages({
        "string.base": "Password must be a string",
        "string.empty": "Password cannot be empty",
        "string.pattern.base":
          "Password must be 6-30 characters and include at least one lowercase letter, one uppercase letter, one number, and one special character",
        "any.required": "Password is required",
      }),

      firstName: Joi.string().required().min(2).max(50).messages({
        "string.base": "First name must be a string",
        "string.empty": "First name cannot be empty",
        "string.min": "First name must be at least 2 characters long",
        "string.max": "First name cannot be longer than 50 characters",
        "any.required": "First name is required",
      }),

      lastName: Joi.string().required().min(2).max(50).messages({
        "string.base": "Last name must be a string",
        "string.empty": "Last name cannot be empty",
        "string.min": "Last name must be at least 2 characters long",
        "string.max": "Last name cannot be longer than 50 characters",
        "any.required": "Last name is required",
      }),

      role: Joi.string().valid("user", "manager").messages({
        "string.base": "Role must be a string",
        "any.only": "Role must be either 'user' or 'manager'",
      }),

      // --- ADDED DEPARTMENT FIELD ---
      department: Joi.string()
        .hex() // Ensures the string contains only hexadecimal characters
        .length(24) // Ensures the string is exactly 24 characters long
        .optional() // Makes the field optional
        .messages({
          "string.base": "Department ID must be a string",
          "string.hex":
            "Department ID must only contain hexadecimal characters",
          "string.length": "Department ID must be exactly 24 characters long",
        }),
    }),
  },

  /**
   * Validation for PATCH /api/users/:id
   */ 
  updateUser: {
    params: Joi.object({
      id: Joi.string().required().regex(objectIdRegex).messages({
        "string.base": "User ID must be a string",
        "string.empty": "User ID cannot be empty",
        "string.pattern.base": "User ID must be a valid MongoDB ObjectId",
        "any.required": "User ID is required in the URL",
      }),
    }),
    body: Joi.object({
      username: Joi.string()
        .regex(/^[a-z][a-z0-9]+$/)
        .min(3)
        .max(30)
        .messages({
          "string.pattern.base":
            "Username must start with a letter and can only contain letters and numbers",
          "string.min": "Username must be at least 3 characters long",
          "string.max": "Username cannot be longer than 30 characters",
        }),

      password: Joi.string().regex(passwordRegrex).messages({
        "string.pattern.base":
          "Password must be 6-30 characters and include at least one lowercase letter, one uppercase letter, one number, and one special character",
      }),

      firstName: Joi.string().min(2).max(50).messages({
        "string.min": "First name must be at least 2 characters long",
        "string.max": "First name cannot be longer than 50 characters",
      }),

      lastName: Joi.string().min(2).max(50).messages({
        "string.min": "Last name must be at least 2 characters long",
        "string.max": "Last name cannot be longer than 50 characters",
      }),

      email: Joi.string().email().messages({
        "string.email": "Please provide a valid email address",
      }),

      phoneNumber: Joi.string().min(10).max(15).messages({
        "string.min": "Phone number must be at least 10 characters long",
        "string.max": "Phone number cannot be longer than 15 characters",
      }),

      status: Joi.string().valid("active", "inactive", "suspended").messages({
        "any.only":
          "Status must be one of 'active', 'inactive', or 'suspended'",
      }),

      department: Joi.string().min(2).max(50).messages({
        "string.min": "Department must be at least 2 characters long",
        "string.max": "Department cannot be longer than 50 characters",
      }),

      isDeleted: Joi.boolean().messages({
        "boolean.base": "'isDeleted' must be a boolean (true or false)",
      }),

      role: Joi.string().valid("user", "manager").messages({
        "any.only": "Role must be either 'user' or 'manager'",
      }),
    })
      .min(1) // Body must contain at least one field to update
      .messages({
        "object.min": "Request body must contain at least one field to update.",
      }),
  },

  /**
   * Validation for GET /api/users/:id
   */
  getUser: {
    params: Joi.object({
      id: Joi.string().required().regex(objectIdRegex).messages({
        "string.pattern.base": "User ID must be a valid MongoDB ObjectId",
        "any.required": "User ID is required in the URL",
      }),
    }),
  },

  /**
   * Validation for DELETE /api/users/:id
   */
  deleteUser: {
    params: Joi.object({
      id: Joi.string().required().regex(objectIdRegex).messages({
        "string.pattern.base": "User ID must be a valid MongoDB ObjectId",
        "any.required": "User ID is required in the URL",
      }),
    }),
  },
};

export default userValidation;
