import express from "express";
import cors from "cors";
import { ApiError } from "#utils/api.utils.js";
import router from "#routes/index.js";
import { swaggerServe, swaggerSetup } from "#config/swagger.config.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);
app.options(/.*/, (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204);
});

app.use("/api/doc", swaggerServe, swaggerSetup);
app.use("/api", router);

app.use(async (err, req, res, next) => {      
  if (err instanceof ApiError) {
    res.status(err.code).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  } else {
    console.error("Server Error:", err);

    res.status(err.code || 500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

export { app };
