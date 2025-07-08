import {
	createInquiryFormRequest,
	deleteInquiryFormRequest,
	getInquiryFormRequests,
} from "@/controllers/inquiryForm.controller";
import express from "express";

const inquiryFormRouter = express.Router();

/**
 * @route   POST / /api/inquiry
 * @desc    Create a new inquiry form request
 * @access  Public
 */
inquiryFormRouter.post("/", createInquiryFormRequest);

/**
 * @route   GET / /api/inquiry
 * @desc    Get all inquiry form requests
 * @access  Public
 */
inquiryFormRouter.get("/", getInquiryFormRequests);

/**
 * @route   DELETE /:id /api/inquiry/:id
 * @desc    Delete an inquiry form request by ID
 * @access  admin
 */
inquiryFormRouter.delete("/:id", deleteInquiryFormRequest);

export default inquiryFormRouter;
