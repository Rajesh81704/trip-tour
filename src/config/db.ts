import mongoose from "mongoose";
import { logger } from "@/utils/logger";

const connectDB = async (retries = 3): Promise<typeof mongoose> => {
	// Reuse existing connection
	if (mongoose.connection.readyState >= 1) {
		return mongoose;
	}

	if (!process.env.MONGODB_URI) {
		throw new Error("MONGODB_URI is not defined in environment variables");
	}

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const connection = await mongoose.connect(process.env.MONGODB_URI, {
				serverSelectionTimeoutMS: 5000,
			});
			logger.info("Connected to MongoDB successfully");
			return connection;
		} catch (error) {
			logger.error(`Error connecting to MongoDB (Attempt ${attempt}/${retries}):`, error);
			if (attempt < retries) {
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
		}
	}

	throw new Error("Could not connect to MongoDB after multiple attempts");
};

export { connectDB };
