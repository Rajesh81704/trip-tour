import { Request, Response, NextFunction } from "express";
import { ReviewModel } from "@/models/review.model";
import { PackageModel } from "@/models/package.model";
import { ErrorHandler } from "@/middlewares/error-handler.middleware";
import mongoose from "mongoose";

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { rating, comment, package: packageId } = req.body;
		const userId = (req.user as { id: string })?.id;
		if (!rating || !comment || !packageId) {
			return res.status(400).json({ message: "Missing required fields (rating, comment, package)" });
		}
		if (!userId) {
			return res.status(401).json({ message: "Unauthorized: user not found" });
		}

		if (!mongoose.Types.ObjectId.isValid(packageId)) {
			return res.status(400).json({ message: "Invalid package ID" });
		}

		const newReview = await ReviewModel.create({
			rating: Number(rating),
			comment: String(comment).trim(),
			user: userId,
			package: packageId,
		});

		await PackageModel.findByIdAndUpdate(
			packageId,
			{ $push: { reviews: newReview._id } },
			{ new: true },
		);

		const populatedReview = await ReviewModel.findById(newReview._id)
			.populate("user", "name email avatar")
			.populate("package", "title description");

		return res.status(201).json({ success: true, review: populatedReview });
	} catch (error) {
		if (error instanceof Error) {
			return next(new ErrorHandler(400, error.message));
		}
		return next(new ErrorHandler(500, "Internal server error"));
	}
};

export const getAllReviews = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { packageId, userId } = req.query;
		let query = {};

		if (packageId) {
			if (!mongoose.Types.ObjectId.isValid(packageId as string)) {
				return res.json([]);
			}
			query = { ...query, package: packageId };
		}

		if (userId) {
			if (!mongoose.Types.ObjectId.isValid(userId as string)) {
				return res.json([]);
			}
			query = { ...query, user: userId };
		}

		const reviews = await ReviewModel.find(query)
			.populate("user", "name email avatar")
			.populate({
				path: "package",
				select: "title description price location reviews",
				populate: {
					path: "reviews",
					select: "rating comment",
				},
			})
			.sort({ createdAt: -1 });

		return res.json(reviews);
	} catch (error) {
		if (error instanceof Error) {
			return next(new ErrorHandler(400, error.message));
		}
		return next(new ErrorHandler(500, "Internal server error"));
	}
};

export const getReviewById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid review ID" });
		}

		const review = await ReviewModel.findById(id)
			.populate("user", "name email avatar")
			.populate("package", "title description");

		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		return res.json(review);
	} catch (error) {
		if (error instanceof Error) {
			return next(new ErrorHandler(400, error.message));
		}
		return next(new ErrorHandler(500, "Internal server error"));
	}
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const { rating, comment } = req.body;
		const userId = (req.user as { id: string })?.id;
		const isAdmin = !!(req as any).admin;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid review ID" });
		}

		const review = await ReviewModel.findById(id);
		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		if (!isAdmin && userId && review.user.toString() !== userId) {
			return res.status(403).json({ message: "Forbidden: You can only edit your own review" });
		}

		if (rating) review.rating = Number(rating);
		if (comment !== undefined) review.comment = String(comment).trim();

		await review.save();

		const updatedReview = await ReviewModel.findById(id)
			.populate("user", "name email avatar")
			.populate("package", "title description");

		return res.json({ success: true, review: updatedReview });
	} catch (error) {
		if (error instanceof Error) {
			return next(new ErrorHandler(400, error.message));
		}
		return next(new ErrorHandler(500, "Internal server error"));
	}
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const userId = (req.user as { id: string })?.id;
		const isAdmin = !!(req as any).admin;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid review ID" });
		}

		const review = await ReviewModel.findById(id);
		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		if (!isAdmin && userId && review.user.toString() !== userId) {
			return res.status(403).json({ message: "Forbidden: You can only delete your own review" });
		}

		await ReviewModel.findByIdAndDelete(id);

		await PackageModel.findByIdAndUpdate(
			review.package,
			{ $pull: { reviews: review._id } },
			{ new: true },
		);
		return res.json({ success: true, message: "Review deleted successfully" });
	} catch (error) {
		if (error instanceof Error) {
			return next(new ErrorHandler(400, error.message));
		}
		return next(new ErrorHandler(500, "Internal server error"));
	}
};
