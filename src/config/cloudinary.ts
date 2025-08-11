import { v2 as cloudinary } from "cloudinary";
import { config } from "./config";
import { logger } from "@/utils/logger";

// Configure cloudinary
if (!config.cloudinaryName || !config.cloudinaryApiKey || !config.cloudinarySecret) {
	logger.error("Missing Cloudinary configuration. Please check your environment variables.");
	throw new Error("Cloudinary configuration is incomplete");
}

cloudinary.config({
	cloud_name: config.cloudinaryName,
	api_key: config.cloudinaryApiKey,
	api_secret: config.cloudinarySecret,
});

export { cloudinary };
