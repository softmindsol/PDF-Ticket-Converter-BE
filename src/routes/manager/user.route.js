import express from "express";
import { auth } from "#middlewares/auth.js";
const router = express.Router();
router.use(auth(["manager"]));

router.get("/", (req, res) => {
    res.json({
      message: "Hello Manager! You have access to all routes in this file.",
      user: req.user, 
    });
  });

export default router;
