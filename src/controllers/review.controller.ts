import { Request, Response } from "express";
import { ReviewModel } from "../models/review.model";
import { ErrorHandler } from "@/middlewares/error-handler.middleware";
import mongoose from "mongoose";

export const createReview = async (req: Request, res: Response) => {
	try {
		console.log("req.body", req.body);
		console.log("req.user", req.user);
		const { rating, comment, package: packageId } = req.body;
		const userId = (req.user as { id: string })?.id;
		if (!rating || !comment || !packageId) {
			return res.status(400).json({ message: "Missing required fields" });
		}
		if (!userId) {
			return res.status(401).json({ message: "Unauthorized: user not found" });
		}

		if (!mongoose.Types.ObjectId.isValid(packageId)) {
			return res.status(400).json({ message: "Invalid package ID" });
		}

		const newReview = await ReviewModel.create({
			rating,
			comment,
			user: userId,
			package: packageId,
		});

		const { PackageModel } = await import("../models/package.model");
		await PackageModel.findByIdAndUpdate(
			packageId,
			{ $push: { reviews: newReview._id } },
			{ new: true },
		);

		res.status(201).json({ success: true, review: newReview });
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Internal server error");
	}
};

export const getAllReviews = async (req: Request, res: Response) => {
	try {
		const { packageId, userId } = req.query;
		let query = {};

		if (packageId) {
			if (!mongoose.Types.ObjectId.isValid(packageId as string)) {
				return res.status(400).json({ message: "Invalid package ID" });
			}
			query = { ...query, package: packageId };
		}

		if (userId) {
			if (!mongoose.Types.ObjectId.isValid(userId as string)) {
				return res.status(400).json({ message: "Invalid user ID" });
			}
			query = { ...query, user: userId };
		}

		const reviews = await ReviewModel.find(query)
			.populate("user", "name email")
			.populate("package", "title description")
			.sort({ createdAt: -1 });

		res.json(reviews);
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Internal server error");
	}
};

export const getReviewById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid review ID" });
		}

		const review = await ReviewModel.findById(id)
			.populate("user", "name email")
			.populate("package", "title description");

		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		res.json(review);
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Internal server error");
	}
};

export const deleteReview = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const review = await ReviewModel.findByIdAndDelete(id);
		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}
		const { PackageModel } = await import("../models/package.model");
		await PackageModel.findByIdAndUpdate(
			review.package,
			{ $pull: { reviews: review._id } },
			{ new: true },
		);
		res.json({ success: true, message: "Review deleted successfully" });
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Internal server error");
	}
};
