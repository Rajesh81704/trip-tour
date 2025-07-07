import { config as conf } from "dotenv";

conf();

const _config = {
    port: process.env.PORT,
    databaseUrl: process.env.MONGODB_URI,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.SECRET,
    cloudinaryName: process.env.CLOUD_NAME,
    cloudinaryApiKey: process.env.API_KEY,
    cloudinarySecret: process.env.API_SECRET,
    frontendUrlDev: process.env.FRONTEND_URL_DEV,
    frontendUrlProd: process.env.FRONTEND_URL_PROD,
};

export const config = Object.freeze(_config);