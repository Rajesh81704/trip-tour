import express from "express";
import {
	createReview,
	getAllReviews,
	getReviewById,
	updateReview,
	deleteReview,
} from "@/controllers/review.controller";
import { userVerify, userOrAdminVerify } from "@/middlewares/userverify.middleware";

const reviewRouter = express.Router();

reviewRouter.post("/", userVerify, createReview);
reviewRouter.get("/", getAllReviews);
reviewRouter.get("/:id", getReviewById);
reviewRouter.put("/:id", userOrAdminVerify, updateReview);
reviewRouter.delete("/:id", userOrAdminVerify, deleteReview);

export default reviewRouter;
