import "module-alias/register.js";
import http from "http";
import connectDB from "#config/db.config.js";
import { app } from "./app.js";
import { PORT } from "#config/env.config.js";
import mongoose from "mongoose";
import { createAdmin } from "#admin/admin.js";


const server = http.createServer(app); 

await connectDB()
.then(() => {
const mongooseConnection = mongoose.connection;

// setup middlewares, routes...
createAdmin(app, mongooseConnection);
})
  .then(() => {
    server.listen(PORT, () => {
      console.log(`⚙️ Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed!", err);
    process.exit(1); 
  });

