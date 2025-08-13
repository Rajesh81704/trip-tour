import { Request, Response } from "express";
import { B2BModel, IB2B } from "@/models/b2b.model";
import { ErrorHandler } from "@/middlewares/error-handler.middleware";
import mongoose from "mongoose";

export const getB2B = async (_req: Request, res: Response) => {
	try {
		const b2bRequests = await B2BModel.find().sort({ createdAt: -1 });
		if (!b2bRequests || b2bRequests.length === 0) {
			return res.status(404).json({ message: "No B2B requests found." });
		}
		return res.status(200).json({
			success: true,
			message: "B2B requests fetched successfully.",
			data: b2bRequests,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Internal server error");
	}
};

export const CreateB2BRequest = async (req: Request, res: Response) => {
	try {
		const { companyName, email, phone, website, message, inquiryType, contactName } =
			req.body as IB2B;

		if (!companyName || !email || !phone || !message || !inquiryType) {
			return res.status(400).json({ message: "All fields are required." });
		}

		const newB2BRequest = await B2BModel.create({
			companyName,
			email,
			phone,
			website,
			message,
			contactName,
			inquiryType,
		});

		return res.status(201).json({
			success: true,
			message: "B2B request created successfully.",
			data: newB2BRequest,
		});
	} catch (error) {
		console.error("Error creating B2B request:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getB2BById = async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ message: "B2B request ID is required." });
	}
	if (mongoose.isValidObjectId(id) === false) {
		return res.status(400).json({ message: "Invalid B2B request ID format." });
	}
	try {
		const b2bRequest = await B2BModel.findById(id);
		if (!b2bRequest) {
			throw new ErrorHandler(404, "B2B request not found");
		}
		return res.status(200).json({
			success: true,
			message: "B2B request fetched successfully.",
			data: b2bRequest,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Internal server error");
	}
};

export const deleteB2BRequest = async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ message: "B2B request ID is required." });
	}
	if (mongoose.isValidObjectId(id) === false) {
		return res.status(400).json({ message: "Invalid B2B request ID format." });
	}
	try {
		const deletedB2BRequest = await B2BModel.findByIdAndDelete(id);
		if (!deletedB2BRequest) {
			throw new ErrorHandler(404, "B2B request not found");
		}
		return res.status(200).json({
			success: true,
			message: "B2B request deleted successfully.",
			data: deletedB2BRequest,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Internal server error");
	}
};
