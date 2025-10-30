import dotenv from 'dotenv'
dotenv.config({
  path: './.env'
})
 
const {MONGO_URI, PORT, JWT_SECRET, NODE_ENV, SERVER_URL, CLIENT_URL} = process.env
const SWAGGER_STAGE_URL = NODE_ENV === 'production' ? SERVER_URL : `http://localhost:${PORT}/api`

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

export { MONGO_URI,PORT,ALLOWED_ORIGINS,JWT_SECRET, SWAGGER_STAGE_URL , CLIENT_URL}