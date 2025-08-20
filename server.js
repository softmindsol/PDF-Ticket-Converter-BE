import "module-alias/register.js";
import http from "http";
import connectDB from "#config/db.config.js";
import { app } from "./app.js";
import { PORT } from "#config/env.config.js";


const server = http.createServer(app); 

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`⚙️ Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed!", err);
    process.exit(1); 
  });

