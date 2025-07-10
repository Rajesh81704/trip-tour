import mongoose from "mongoose";
import { logger } from "@/utils/logger";

const connectDB = async (): Promise<typeof mongoose> => {
	try {
		if (!process.env.MONGODB_URI) {
			throw new Error("MONGODB_URI is not defined in environment variables");
		}

		const connection = await mongoose.connect(process.env.MONGODB_URI);
		logger.info("Connected to MongoDB");
		return connection;
	} catch (error) {
		logger.error("Error connecting to MongoDB:", error);
		process.exit(1);
	}
};

export { connectDB };
