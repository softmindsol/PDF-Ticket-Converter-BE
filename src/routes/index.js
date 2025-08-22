import express from "express";
import authRoute from "./auth.route.js";
import managerRoute from "./admin/manager.route.js";
import userRoute from "./manager/user.route.js";
import departmentRoute from "./admin/department.route.js";
const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/admin/manager",
    route: managerRoute,
  },
  {
    path: "/admin/department",
    route: departmentRoute,
  },
  {
    path: "/manager/user",
    route: userRoute,
  },

];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
