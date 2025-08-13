import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";

import { config } from "@/config/config";
import { connectDB } from "@/config/db";
import { errorHandler } from "@/middlewares/error-handler.middleware";
import { logger, loggerMiddleware } from "@/utils/logger";

import passport from "@/config/passport";

import { B2BModel } from "@/models/b2b.model";
import { ContactModel } from "@/models/contact.model";
import { InquiryFormModel } from "@/models/inquiryForm.model";
import { PackageModel } from "@/models/package.model";
import { UserModel } from "@/models/user.model";
import { ReviewModel } from "@/models/review.model";

import adminRouter from "@/routes/admin.route";
import authRouter from "@/routes/auth.route";
import b2bRouter from "@/routes/b2b.route";
import contactRouter from "@/routes/contact.route";
import inquiryFormRouter from "@/routes/inquiryForm.route";
import packageRouter from "@/routes/package.route";
import reviewRouter from "@/routes/review.route";
import userRouter from "@/routes/user.route";

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
		origin: [
			"http://localhost:3000",
			"https://www.naturevacation.in",
			"https://naturevacation.in",
			"https://admin.naturevacation.in",
		],
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

app.route("/info").get(async (_req: Request, res: Response) => {
	try {
		// Get total counts
		const totalUsers = await UserModel.countDocuments();
		const totalPackages = await PackageModel.countDocuments();
		const totalInquiries = await InquiryFormModel.countDocuments();
		const totalB2BRequests = await B2BModel.countDocuments();
		const totalContacts = await ContactModel.countDocuments();
		const totalReviews = await ReviewModel.countDocuments();

		// Get recent activity
		const recentInquiries = await InquiryFormModel.find().sort({ createdAt: -1 }).limit(5).lean();

		const recentReviews = await ReviewModel.find()
			.sort({ createdAt: -1 })
			.limit(5)
			.populate("user", "name")
			.populate("package", "name")
			.lean();

		const recentB2BRequests = await B2BModel.find().sort({ createdAt: -1 }).limit(5).lean();

		// Get average ratings
		const reviewStats = await ReviewModel.aggregate([
			{
				$group: {
					_id: null,
					averageRating: { $avg: "$rating" },
					fiveStars: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
					fourStars: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
					threeStars: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
					twoStars: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
					oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
				},
			},
		]);

		// Get most popular packages
		const popularPackages = await PackageModel.find().sort({ viewCount: -1 }).limit(5).lean();

		res.status(200).json({
			// Overview statistics
			totalUsers,
			totalPackages,
			totalInquiries,
			totalB2BRequests,
			totalContacts,
			totalReviews,

			// Recent activity
			recentInquiries,
			recentReviews,
			recentB2BRequests,

			// Review analytics
			reviewStats: reviewStats[0] || {
				averageRating: 0,
				fiveStars: 0,
				fourStars: 0,
				threeStars: 0,
				twoStars: 0,
				oneStar: 0,
			},

			// Popular content
			popularPackages,
		});
	} catch (error) {
		logger.error("Failed to fetch dashboard info:", error);
		res.status(500).json({
			message: "Failed to fetch dashboard information",
		});
	}
});

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
		https.get(config.healthCheckUrl, (res) => {
			logger.info("Health check response:", res.statusCode);
			res.on("data", (chunk) => {
				logger.info("Health check response:", chunk.toString());
			});
		});
	} catch (error) {
		logger.error("Health check failed:", error);
	}
});

// cron.schedule("*/30 * * * * *", async () => {
// 	try {
// 		https.get(config.healthCheckUrl, (res) => {
// 			logger.info("Health check response:", res.statusCode);
// 			res.on("data", (chunk) => {
// 				logger.info("Health check response:", chunk.toString());
// 			});
// 		});
// 	} catch (error) {
// 		logger.error("Health check failed:", error);
// 	}
// });

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
