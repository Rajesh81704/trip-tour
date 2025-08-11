import { config as conf } from "dotenv";

conf();

const _config = {
	port: process.env.PORT,
	databaseUrl: process.env.MONGODB_URI,
	env: process.env.NODE_ENV,
	jwtSecret: process.env.JWT_SECRET,
	cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME,
	cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
	cloudinarySecret: process.env.CLOUDINARY_API_SECRET,
	frontendUrlDev: process.env.FRONTEND_URL_DEV,
	frontendUrlProd: process.env.FRONTEND_URL_PROD,
	googleClientId: process.env.GOOGLE_CLIENT_ID,
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
	healthCheckUrl: process.env.HEALTH_CHECK_URL,
};

export const config = Object.freeze(_config);
