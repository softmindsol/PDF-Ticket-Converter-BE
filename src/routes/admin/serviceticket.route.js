import express from "express";
import { auth } from "#middlewares/auth.js";

import {
  createServiceTicket,
  getServiceTickets,
  getServiceTicketById,
  updateServiceTicket,
  deleteServiceTicket,
} from "#controllers/admin/serviceTicket.controller.js";

const router = express.Router();

router.use(auth(["admin"]));

router.route("/").post(createServiceTicket).get(getServiceTickets);

router
  .route("/:id")
  .get(getServiceTicketById)
  .patch(updateServiceTicket)
  .delete(deleteServiceTicket);

export default router;
