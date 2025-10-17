import express from "express";
import { auth } from "#middlewares/auth.js";


import {
  createWorkOrder,
  getWorkOrders,
  getWorkOrderById,
  updateWorkOrder,
  deleteWorkOrder,
} from "#controllers/admin/workOrder.controller.js";

const router = express.Router();

router.use(auth(["admin", "manager"]));

router.route("/").post(createWorkOrder).get(getWorkOrders);

router
  .route("/:id")
  .get(getWorkOrderById)
  .patch(updateWorkOrder)
  .delete(deleteWorkOrder);

export default router;
