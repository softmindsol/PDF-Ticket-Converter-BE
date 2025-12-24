import Joi from "joi";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const departmentValidation = {
  getDepartment: {
    params: Joi.object({
      id: Joi.string().required().regex(objectIdRegex).messages({
        "string.pattern.base": "Department ID must be a valid MongoDB ObjectId",
        "any.required": "Department ID is required in the URL",
      }),
    }),
  },

  createDepartment: {
    body: Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        "string.base": "Name must be a string",
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name cannot be longer than 100 characters",
        "any.required": "Name is a required field",
      }),

      description: Joi.string().max(500).optional().allow("").messages({
        "string.base": "Description must be a string",
        "string.max": "Description cannot be longer than 500 characters",
      }),

      status: Joi.string().valid("active", "inactive").default("active").messages({
        "any.only": "Status must be either 'active' or 'inactive'",
      }),

      doc: Joi.array().items(Joi.string()).optional().default([]).messages({
        "array.base": "doc must be an array of strings",
      }),

      allowedForms: Joi.array()
        .items(
          Joi.string().valid(
            "AboveGround",
            "serviceTicket",
            "underGround",
            "workOrder",
            "customer",
            "alarm"
          )
        )
        .messages({
          "array.base": "allowedForms must be an array",
          "any.only":
            "allowedForms can only include 'AboveGround', 'serviceTicket', 'underGround', 'workOrder', 'customer', 'alarm'",
        }),

      manager: Joi.array()
        .items(
          Joi.string().regex(objectIdRegex).messages({
            "string.pattern.base":
              "Each manager ID must be a valid MongoDB ObjectId.",
          })
        )
        .optional()
        .default([]),
    }),
  },

  updateDepartment: {
    params: Joi.object({
      id: Joi.string().required().regex(objectIdRegex).messages({
        "string.base": "Department ID must be a string",
        "string.empty": "Department ID cannot be empty",
        "string.pattern.base": "Department ID must be a valid MongoDB ObjectId",
        "any.required": "Department ID is required in the URL",
      }),
    }),
    body: Joi.object({
      name: Joi.string().min(2).max(100).messages({
        "string.base": "Name must be a string",
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name cannot be longer than 100 characters",
      }),

      description: Joi.string().max(500).optional().allow("").messages({
        "string.base": "Description must be a string",
        "string.max": "Description cannot be longer than 500 characters",
      }),

      status: Joi.string().valid("active", "inactive").messages({
        "any.only": "Status must be either 'active' or 'inactive'",
      }),

      isDeleted: Joi.boolean().messages({
        "boolean.base": "'isDeleted' must be a boolean (true or false)",
      }),

      doc: Joi.array().items(Joi.string()).optional().default([]).messages({
        "array.base": "doc must be an array of strings",
      }),

      allowedForms: Joi.array()
        .items(
          Joi.string().valid(
            "AboveGround",
            "serviceTicket",
            "underGround",
            "workOrder",
            "customer",
            "alarm"
          )
        )
        .messages({
          "array.base": "allowedForms must be an array",
          "any.only":
            "allowedForms can only include 'AboveGround', 'serviceTicket', 'underGround', 'workOrder', 'customer'",
        }),

      manager: Joi.array()
        .items(
          Joi.string().regex(objectIdRegex).messages({
            "string.pattern.base":
              "Each manager ID must be a valid MongoDB ObjectId.",
          })
        )
        .optional()
        .default([]),
    })
      .min(1)
      .messages({
        "object.min": "Request body must contain at least one field to update.",
      }),
  },

  deleteDepartment: {
    params: Joi.object({
      id: Joi.string().required().regex(objectIdRegex).messages({
        "string.pattern.base": "Department ID must be a valid MongoDB ObjectId",
        "any.required": "Department ID is required in the URL",
      }),
    }),
  },
};

export default departmentValidation;
