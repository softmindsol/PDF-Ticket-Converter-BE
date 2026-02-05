import express from "express";
import cors from "cors";
import { ApiError } from "#utils/api.utils.js";
import router from "#routes/index.js";
import { swaggerServe, swaggerSetup } from "#config/swagger.config.js";

const app = express();

// JSON parsing
app.use(express.json({ limit: '30mb' }));

// Serve static files
app.use(express.static("public"));

// CORS configuration
app.use(
  cors({
    origin: "https://admin.southernfireforms.com", // Your frontend domain
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    credentials: true, // Allow cookies
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Swagger docs
app.use("/api/doc", swaggerServe, swaggerSetup);

// API routes
app.use("/api", router);

// Error handling middleware
app.use(async (err, req, res, next) => {
  if (err instanceof ApiError) {
    res.status(err.code).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  } else {
    console.error("Server Error:", err);
    // Ensure status code is a valid HTTP status (100-599)
    const statusCode =
      typeof err.statusCode === "number" &&
        err.statusCode >= 100 &&
        err.statusCode <= 599
        ? err.statusCode
        : 500;

    res.status(statusCode).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

export { app };