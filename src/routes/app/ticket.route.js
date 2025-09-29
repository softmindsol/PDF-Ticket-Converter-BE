import express from "express";
import {createCustomer} from  "#controllers/app/customer.controller.js"
const router = express.Router();

router.post("/customer-ticket", createCustomer );


export default router;



/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NewCustomer:
 *       type: object
 *       required:
 *         - customerName
 *         - phoneNumber
 *         - emailForInspectionReports
 *         - onSiteContactName
 *         - onSitePhoneNumber
 *         - onSiteEmailAddress
 *         - buildingName
 *         - typeOfSite
 *         - siteAddress
 *         - billingName
 *         - billingContactNumber
 *         - billingEmailAddress
 *         - ownerName
 *         - ownerContactNumber
 *         - ownerAddress
 *         - ownerEmailAddress
 *       properties:
 *         customerName:
 *           type: string
 *           example: "Global Tech Inc."
 *         phoneNumber:
 *           type: string
 *           example: "555-123-4567"
 *         emailForInspectionReports:
 *           type: string
 *           format: email
 *           example: "reports@globaltech.com"
 *         onSiteContactName:
 *           type: string
 *           example: "John Smith"
 *         onSitePhoneNumber:
 *           type: string
 *           example: "555-987-6543"
 *         onSiteEmailAddress:
 *           type: string
 *           format: email
 *           example: "john.smith@globaltech.com"
 *         buildingName:
 *           type: string
 *           example: "Main Headquarters"
 *         typeOfSite:
 *           type: string
 *           example: "Commercial Office Building"
 *         siteAddress:
 *           type: string
 *           example: "123 Innovation Drive, Tech City, TX 75001"
 *         billingName:
 *           type: string
 *           example: "Global Tech Inc. Accounts Payable"
 *         billingContactNumber:
 *           type: string
 *           example: "555-111-2222"
 *         billingEmailAddress:
 *           type: string
 *           format: email
 *           example: "ap@globaltech.com"
 *         ownerName:
 *           type: string
 *           example: "Corporate Properties LLC"
 *         ownerContactNumber:
 *           type: string
 *           example: "555-333-4444"
 *         ownerAddress:
 *           type: string
 *           example: "456 Enterprise Ave, Business Town, TX 75002"
 *         ownerEmailAddress:
 *           type: string
 *           format: email
 *           example: "contact@corporateproperties.com"
 *         taxExemptCertificate:
 *           type: boolean
 *           description: "Defaults to false if not provided."
 *           example: false
 *         directPayCertificate:
 *           type: boolean
 *           description: "Defaults to false if not provided."
 *           example: false
 *     CustomerResponse:
 *        allOf:
 *          - $ref: '#/components/schemas/NewCustomer'
 *          - type: object
 *            properties:
 *              _id:
 *                type: string
 *                example: "60d0fe4f5311236168a109ca"
 *              createdBy:
 *                type: string
 *                example: "60d0fe4f5311236168a109cb"
 *              createdAt:
 *                type: string
 *                format: date-time
 *                example: "2025-09-15T14:00:00.000Z"
 *              updatedAt:
 *                type: string
 *                format: date-time
 *                example: "2025-09-15T14:00:00.000Z"
 */

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     description: Adds a new customer record to the database. The `createdBy` field is automatically populated based on the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewCustomer'
 *     responses:
 *       '201':
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerResponse'
 *       '400':
 *         description: Bad Request - Validation error
 */
