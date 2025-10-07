import express from "express";
import { auth } from "#middlewares/auth.js";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "#controllers/admin/Customer.controller.js";

const router = express.Router();

router.use(auth(["admin"]));

router.route("/").post(createCustomer).get(getCustomers);

router
  .route("/:id")
  .get(getCustomerById)
  .patch(updateCustomer)
  .delete(deleteCustomer);

export default router;
