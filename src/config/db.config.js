import mongoose from 'mongoose';
import { MONGO_URI } from './env.config.js';

const MAX_RETRIES = 3;  
const RETRY_DELAY = 2000;  

const connectDB = async () => {
  let attempts = 0;   

  while (attempts < MAX_RETRIES) {
    try {
      console.log(`Attempting to connect to MongoDB (Attempt ${attempts + 1}/${MAX_RETRIES})...`);
      const connectionInstance = await mongoose.connect(MONGO_URI, {
        connectTimeoutMS: 100000,  
        socketTimeoutMS: 45000    
      });
      console.log(`MongoDB connected successfully !! DB HOST: ${connectionInstance.connection.host}`);
      return; 
    } catch (error) {
      attempts++;
      console.error(`MongoDB connection FAILED (attempt ${attempts} of ${MAX_RETRIES})`, error.message);

      if (attempts >= MAX_RETRIES) {
        console.error('Max retries reached. Exiting the process...');
        process.exit(1); 
      } else {
        console.log(`Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
        await new Promise(res => setTimeout(res, RETRY_DELAY)); 
      }
    }  
  }  
};

export default connectDB;
