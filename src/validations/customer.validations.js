import Joi from "joi";

const customerValidation = {
  createCustomer: {
    body: Joi.object({
      customerName: Joi.string().required().messages({
        "string.base": "Customer name must be a string",
        "string.empty": "Customer name cannot be empty",
        "any.required": "Customer name is required",
      }),
      phoneNumber: Joi.string().required().min(10).max(15).messages({
        "string.base": "Phone number must be a string",
        "string.empty": "Phone number cannot be empty",
        "string.min": "Phone number must be at least 10 characters long",
        "string.max": "Phone number cannot be longer than 15 characters",
        "any.required": "Phone number is required",
      }),
      emailForInspectionReports: Joi.string().email().required().messages({
        "string.base": "Email for inspection reports must be a string",
        "string.empty": "Email for inspection reports cannot be empty",
        "string.email": "Please provide a valid email for inspection reports",
        "any.required": "Email for inspection reports is required",
      }),
      onSiteContactName: Joi.string().required().messages({
        "string.base": "On-site contact name must be a string",
        "string.empty": "On-site contact name cannot be empty",
        "any.required": "On-site contact name is required",
      }),
      onSitePhoneNumber: Joi.string().required().min(10).max(15).messages({
        "string.base": "On-site phone number must be a string",
        "string.empty": "On-site phone number cannot be empty",
        "string.min": "On-site phone number must be at least 10 characters long",
        "string.max": "On-site phone number cannot be longer than 15 characters",
        "any.required": "On-site phone number is required",
      }),
      onSiteEmailAddress: Joi.string().email().required().messages({
        "string.base": "On-site email address must be a string",
        "string.empty": "On-site email address cannot be empty",
        "string.email": "Please provide a valid on-site email address",
        "any.required": "On-site email address is required",
      }),

      buildingName: Joi.string().required().messages({
        "string.base": "Building name must be a string",
        "string.empty": "Building name cannot be empty",
        "any.required": "Building name is required",
      }),
      typeOfSite: Joi.string().required().messages({
        "string.base": "Type of site must be a string",
        "string.empty": "Type of site cannot be empty",
        "any.required": "Type of site is required",
      }),
      siteAddress: Joi.string().required().messages({
        "string.base": "Site address must be a string",
        "string.empty": "Site address cannot be empty",
        "any.required": "Site address is required",
      }),

      billingName: Joi.string().required().messages({
        "string.base": "Billing name must be a string",
        "string.empty": "Billing name cannot be empty",
        "any.required": "Billing name is required",
      }),
      billingContactNumber: Joi.string().required().min(10).max(15).messages({
        "string.base": "Billing contact number must be a string",
        "string.empty": "Billing contact number cannot be empty",
        "string.min": "Billing contact number must be at least 10 characters long",
        "string.max": "Billing contact number cannot be longer than 15 characters",
        "any.required": "Billing contact number is required",
      }),
      billingEmailAddress: Joi.string().email().required().messages({
        "string.base": "Billing email address must be a string",
        "string.empty": "Billing email address cannot be empty",
        "string.email": "Please provide a valid billing email address",
        "any.required": "Billing email address is required",
      }),

      ownerName: Joi.string().required().messages({
        "string.base": "Owner name must be a string",
        "string.empty": "Owner name cannot be empty",
        "any.required": "Owner name is required",
      }),
      ownerContactNumber: Joi.string().required().min(10).max(15).messages({
        "string.base": "Owner contact number must be a string",
        "string.empty": "Owner contact number cannot be empty",
        "string.min": "Owner contact number must be at least 10 characters long",
        "string.max": "Owner contact number cannot be longer than 15 characters",
        "any.required": "Owner contact number is required",
      }),
      ownerAddress: Joi.string().required().messages({
        "string.base": "Owner address must be a string",
        "string.empty": "Owner address cannot be empty",
        "any.required": "Owner address is required",
      }),
      ownerEmailAddress: Joi.string().email().required().messages({
        "string.base": "Owner email address must be a string",
        "string.empty": "Owner email address cannot be empty",
        "string.email": "Please provide a valid owner email address",
        "any.required": "Owner email address is required",
      }),

      taxExemptCertificate: Joi.boolean().default(false),
      directPayCertificate: Joi.boolean().default(false),
    }),
  },
};

export default customerValidation;