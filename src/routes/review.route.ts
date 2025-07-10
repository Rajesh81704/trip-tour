import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewById,
} from "@/controllers/review.controller";

const reviewRouter = express.Router();

reviewRouter.post("/", createReview);
reviewRouter.get("/", getAllReviews);
reviewRouter.get("/:id", getReviewById);

export default reviewRouter;
