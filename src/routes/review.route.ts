import express from "express";
import { createReview, getAllReviews, getReviewById } from "@/controllers/review.controller";
import { userVerify } from "@/middlewares/userverify.middleware";

const reviewRouter = express.Router();

reviewRouter.post("/", userVerify, createReview);
reviewRouter.get("/", getAllReviews);
reviewRouter.get("/:id", getReviewById);

export default reviewRouter;
