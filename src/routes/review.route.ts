import express from "express";
import {
	createReview,
	getAllReviews,
	getReviewById,
	deleteReview,
} from "@/controllers/review.controller";
import { userVerify } from "@/middlewares/userverify.middleware";
import { adminVerify } from "@/middlewares/adminverify.middleware";

const reviewRouter = express.Router();

reviewRouter.post("/", userVerify, createReview);
reviewRouter.get("/", getAllReviews);
reviewRouter.get("/:id", getReviewById);
reviewRouter.delete("/:id", adminVerify, userVerify, deleteReview);

export default reviewRouter;
