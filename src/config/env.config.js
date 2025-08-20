import dotenv from 'dotenv'
dotenv.config({
  path: './.env'
})
 
const {MONGO_URI, PORT, JWT_SECRET} = process.env
console.log("🚀 ~ MONGO_URI:", MONGO_URI)


const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

export { MONGO_URI,PORT,ALLOWED_ORIGINS,JWT_SECRET }