import { Request, Response } from "express";
import { InquiryForm, InquiryFormModel } from "@/models/inquiryForm.model";
import { ErrorHandler } from "@/middlewares/error-handler.middleware";
import { IUser } from "@/models/user.model";
import mongoose from "mongoose";

export const getMyInquiryRequests = async (req: Request, res: Response): Promise<void> => {
	try {
		const reqUser = req.user as IUser;
		if (!reqUser) {
			throw new ErrorHandler(401, "Unauthorized");
		}

		const userEmail = reqUser.email ? reqUser.email.trim() : "";
		const userPhone = reqUser.phone ? reqUser.phone.trim() : "";

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const query: any[] = [];
		if (userEmail) {
			const escapedEmail = userEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			query.push({ email: { $regex: new RegExp(`^${escapedEmail}$`, "i") } });
		}
		if (userPhone) {
			const escapedPhone = userPhone.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			query.push({ mobileNumber: { $regex: new RegExp(`^${escapedPhone}$`, "i") } });
		}

		const inquiries = await InquiryFormModel.find(
			query.length > 0 ? { $or: query } : { email: userEmail }
		)
			.populate("packageId")
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			data: inquiries,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
		console.error("Error in getMyInquiryRequests:", errorMessage);
		throw new ErrorHandler(500, errorMessage);
	}
};

export const createInquiryFormRequest = async (req: Request, res: Response): Promise<void> => {
	try {
		const { name, mobileNumber, email, destination, message, packageId } = req.body;
		if (!name || !mobileNumber || !email || !destination || !message) {
			throw new ErrorHandler(400, "All fields are required.");
		}

		if (!/^\d{10}$/.test(mobileNumber)) {
			throw new ErrorHandler(400, "Invalid mobile number format. It should be 10 digits.");
		}
		if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
			throw new ErrorHandler(400, "Invalid email format.");
		}
		let inquiryFormData: InquiryForm;
		let inquiryForm: InquiryForm;
		if (!packageId) {
			inquiryFormData = {
				name,
				mobileNumber,
				email,
				destination,
				message: message,
			};
			inquiryForm = await InquiryFormModel.create(inquiryFormData);
		} else {
			inquiryFormData = {
				name,
				mobileNumber,
				email,
				destination,
				message: message,
				packageId,
			};
			inquiryForm = await InquiryFormModel.create(inquiryFormData as InquiryForm);
		}

		res.status(201).json({
			success: true,
			message: "Inquiry form submitted successfully.",
			data: inquiryForm,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
		console.error("Error in createInquiryFormRequest:", errorMessage);
		throw new ErrorHandler(500, errorMessage);
	}
};

export const getInquiryFormRequests = async (_req: Request, res: Response): Promise<void> => {
	try {
		const inquiries = await InquiryFormModel.find().sort({ createdAt: -1 });

		if (!inquiries || inquiries.length === 0) {
			res.status(404).json({
				success: false,
				message: "No inquiries found.",
			});
		}

		res.status(200).json({
			success: true,
			data: inquiries,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
		console.error("Error in getInquiryFormRequests:", errorMessage);
		throw new ErrorHandler(500, errorMessage);
	}
};

export const deleteInquiryFormRequest = async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;

		if (!id) {
			throw new ErrorHandler(400, "Inquiry ID is required.");
		}

		const inquiry = await InquiryFormModel.findByIdAndDelete(id);
		if (!inquiry) {
			throw new ErrorHandler(404, "Inquiry not found.");
		}

		if (!mongoose.Types.ObjectId.isValid(id)) {
			res.status(400).json({
				success: false,
				message: "Invalid ID format",
			});
		}
		res.status(200).json({
			success: true,
			message: "Inquiry deleted successfully.",
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
		console.error("Error in deleteInquiryFormRequest:", errorMessage);
		throw new ErrorHandler(500, errorMessage);
	}
};
