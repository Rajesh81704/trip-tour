import mongoose from "mongoose";
import { logger } from "@/utils/logger";

const connectDB = async (): Promise<typeof mongoose> => {
	// Reuse existing connection (important for serverless warm invocations)
	if (mongoose.connection.readyState >= 1) {
		return mongoose;
	}

	if (!process.env.MONGODB_URI) {
		throw new Error("MONGODB_URI is not defined in environment variables");
	}

	try {
		const connection = await mongoose.connect(process.env.MONGODB_URI);
		logger.info("Connected to MongoDB");
		return connection;
	} catch (error) {
		logger.error("Error connecting to MongoDB:", error);
		throw error;
	}
};

export { connectDB };
