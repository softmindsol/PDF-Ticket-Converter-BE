import express from "express";
import {createCustomer} from  "#controllers/app/customer.controller.js"
import { WorkOrderTicket } from "#root/src/controllers/app/workOrder.controller.js";
import { auth } from "#root/src/middlewares/auth.js";
const router = express.Router();
router.use(auth(["admin", 'user', "manager"]));
router.post("/customer-ticket", createCustomer );
router.post("/work-order", WorkOrderTicket );


export default router;