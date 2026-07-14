import { v2 as cloudinary } from "cloudinary";
import { config } from "./config";
import { logger } from "@/utils/logger";

// Configure cloudinary
if (!config.cloudinaryName || !config.cloudinaryApiKey || !config.cloudinarySecret) {
	logger.warn("Missing Cloudinary configuration. Image uploads will not work.");
} else {
	cloudinary.config({
		cloud_name: config.cloudinaryName,
		api_key: config.cloudinaryApiKey,
		api_secret: config.cloudinarySecret,
	});
}

export { cloudinary };
