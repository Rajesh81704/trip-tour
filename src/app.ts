import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";

import { config } from "@/config/config";
import { connectDB } from "@/config/db";
import { errorHandler } from "@/middlewares/error-handler.middleware";
import { logger, loggerMiddleware } from "@/utils/logger";

import passport from "@/config/passport";
import authRouter from "@/routes/auth.route";
import b2bRouter from "@/routes/b2b.route";
import contactRouter from "@/routes/contact.route";
import inquiryFormRouter from "@/routes/inquiryForm.route";
import packageRouter from "@/routes/package.route";
import userRouter from "@/routes/user.route";
import reviewRouter from "./routes/review.route";
import adminRouter from "./routes/admin.route";
import cron from "node-cron";
import https from "https";

// import { AdminModel } from "./models/admin.model";
// import bcrypt from "bcrypt";

const app = express();

// 100 requests per 15 minutes per IP
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
});
app.use(limiter);

app.use(loggerMiddleware);

app.use(
	cors({
		origin: [config.frontendUrlDev, config.frontendUrlProd],
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	}),
);

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.get("/health", (_req: Request, res: Response) => {
	res.status(200).json({ message: "Server is healthy" });
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/packages", packageRouter);
app.use("/inquiries", inquiryFormRouter);
app.use("/b2b-requests", b2bRouter);
app.use("/contacts", contactRouter);
app.use("/reviews", reviewRouter);
app.use("/admin", adminRouter);

app.use(errorHandler);

const PORT = Number(config.port) || 8000;

// const createAdminDummy = async () => {
// 	const admin = new AdminModel({
// 		email: "admin@admin.com",
// 		username: "admin",
// 		password: bcrypt.hashSync("admin@123", 12),
// 		name: "Admin",
// 	});
// 	admin.save();
// };

cron.schedule("*/13 * * * *", async () => {
	try {
		https.get(`https://www.google.com`, (res) => {
			logger.info("Health check response:", res.statusCode);
			res.on("data", (chunk) => {
				logger.info("Health check response:", chunk.toString());
			});
		});
	} catch (error) {
		logger.error("Health check failed:", error);
	}
});

connectDB()
	.then(() => {
		// createAdminDummy();
		app.listen(PORT, () => {
			logger.info(`Server is running on http://localhost:${PORT}`);
		});
	})
	.catch((error) => {
		logger.error("Failed to connect to the database:", error);
		process.exit(1);
	});
