import express from "express";
import {createCustomer} from  "#controllers/app/customer.controller.js"
import { WorkOrderTicket } from "#root/src/controllers/app/workOrder.controller.js";
import { auth } from "#root/src/middlewares/auth.js";
import { createAboveGroundTicket } from "#root/src/controllers/app/aboveGround.contoller.js";
import { createServiceTicket } from "#root/src/controllers/app/serviceTicket.controller.js";
import {underGroundTicket} from '#controllers/app/underGround.controller.js'
const router = express.Router();
router.use(auth(["admin", 'user', "manager"]));
router.post("/customer-ticket", createCustomer );
router.post("/service-ticket", createServiceTicket );
router.post("/work-order", WorkOrderTicket );
router.post("/above-ground", createAboveGroundTicket );
router.post("/under-ground", underGroundTicket );


export default router;