import { config } from "@/config/config";
import { connectDB } from "@/config/db";
import { errorHandler } from "@/middlewares/error-handler";

import authRouter from "@/routes/auth.route";
import packageRouter from "@/routes/package.route";
import userRouter from "@/routes/user.route";

import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import passport from "@/config/passport";
import inquiryFormRouter from "@/routes/inquiryForm.route";
import b2bRouter from "@/routes/b2b.route";
import contactRouter from "@/routes/contact.route";
import { logger } from "@/utils/logger";

const app = express();

connectDB();

app.use(
	cors({
		origin: [`${config.frontendUrlDev}`, `${config.frontendUrlProd}`],
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	}),
);

app.use(function (req: Request, _res: Response, next: NextFunction) {
	logger.info(`${req.method} ${req.url}`);
	next();
});

cloudinary.config({
	cloud_name: config.cloudinaryName,
	api_key: config.cloudinaryApiKey,
	api_secret: config.cloudinarySecret,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.get("/health", (_req: Request, res: Response) => {
	res.status(200).json({ message: "Server is healthy" });
});

app.use(errorHandler);
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/packages", packageRouter);
app.use("/inquiries", inquiryFormRouter);
app.use("/b2b-requests", b2bRouter);
app.use("/contacts", contactRouter);

const PORT = Number(config.port) || 8000;

app.listen(PORT, () => {
	logger.info(`Server is running on http://localhost:${PORT}`);
});
