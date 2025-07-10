import { v2 as cloudinary } from "cloudinary";
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

cloudinary.config({
	cloud_name: config.cloudinaryName,
	api_key: config.cloudinaryApiKey,
	api_secret: config.cloudinarySecret,
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.use(errorHandler);

const PORT = Number(config.port) || 8000;

connectDB()
	.then(() => {
		app.listen(PORT, () => {
			logger.info(`Server is running on http://localhost:${PORT}`);
		});
	})
	.catch((error) => {
		logger.error("Failed to connect to the database:", error);
		process.exit(1);
	});
