import express from "express";
import cors from "cors";
import { ApiError } from "#utils/api.utils.js";
import router from "#routes/index.js";
import { swaggerServe, swaggerSetup } from "#config/swagger.config.js";

const app = express();

app.use(express.json());
app.use(express.json({ limit: '30mb' })); 

app.use(express.static("public"));

app.use(
  cors({
    origin: "*", // For development, '*' is fine. For production, specify your frontend's domain.
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    credentials: true,
  })
);


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
