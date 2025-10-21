import express from "express";
import authRoute from "./auth.route.js";
import userRoute from "./admin/user.route.js";
// import userRoute from "./manager/user.route.js";
import departmentRoute from "./admin/department.route.js";
import workOrderRoute from "./admin/workOrder.route.js";
import customerRoute from "./admin/customer.route.js";
import serviceTicketRoute from "./admin/serviceticket.route.js";
import aboveGroundRoute from "./admin/aboveGroundTest.route.js";
import underGroundRoute from "./admin/underground.route.js";
import AppticketRoutes from "./app/ticket.route.js";
import fileHandlerRoute from "./file.routes.js";
const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/admin/user",
    route: userRoute,
  },
  {
    path: "/admin/department",
    route: departmentRoute,
  },
  {
    path: "/admin/work-order",
    route: workOrderRoute,
  },
  {
    path: "/admin/customer-ticket",
    route: customerRoute,
  },
  {
    path: "/admin/service-ticket",
    route: serviceTicketRoute,
  },
  {
    path: "/admin/above-ground",
    route: aboveGroundRoute,
  },
   {
    path: "/admin/under-ground",
    route: underGroundRoute,
  },
   {
    path: "/file",
    route: fileHandlerRoute,
  },
  //\ {
  //   path: "/manager/user",
  //   route: userRoute,
  // },

  // App Routes
  {
    path: "/ticket",
    route: AppticketRoutes,
  },
];

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Enter your JWT token here
 */
defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
