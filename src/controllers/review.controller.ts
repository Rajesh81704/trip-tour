import { Request, Response } from "express";
import ReviewModel from "../models/review.model";
import { ErrorHandler } from "@/middlewares/error-handler.middleware";
import mongoose from "mongoose";

export const createReview = async (req: Request, res: Response) => {
	try {
		const { rating, review, applaud, package: packageId } = req.body;
		const userId = (req.user as any)?._id;
		if (!rating || !review || !packageId) {
			return res.status(400).json({ message: "Missing required fields" });
		}
		if (!userId) {
			return res.status(401).json({ message: "Unauthorized: user not found" });
		}

		// Create the review
		const newReview = await ReviewModel.create({
			rating,
			review,
			user: userId,
			applaud,
			package: packageId,
		});

		// Push the review to the package's reviews array
		const { PackageModel } = await import("../models/package.model");
		await PackageModel.findByIdAndUpdate(
			packageId,
			{ $push: { reviews: newReview._id } },
			{ new: true }
		);

		res.status(201).json({ success: true, review: newReview });
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Internal server error");
	}
};

export const getAllReviews = async (_req: Request, res: Response) => {
	try {
		const reviews = await ReviewModel.find().populate("user", "name email").sort({ createdAt: -1 });

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

		const review = await ReviewModel.findById(id).populate("user", "name email");

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
