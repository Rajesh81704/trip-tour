import { ErrorHandler } from "@/middlewares/error-handler";
import { ContactModel, IContact } from "@/models/contact.model";
import { Request, Response } from "express";
import mongoose from "mongoose";

export const createContact = async (req: Request, res: Response) => {
	try {
		const { name, email, subject, message } = req.body as IContact;
		if (!name || !email || !subject || !message) {
			throw new ErrorHandler(400, "All fields are required.");
		}
		if (
			typeof name !== "string" ||
			typeof email !== "string" ||
			typeof subject !== "string" ||
			typeof message !== "string"
		) {
			throw new ErrorHandler(400, "Invalid data types provided.");
		}
		if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
			throw new ErrorHandler(400, "Invalid email format.");
		}
		if (message.length < 10 || message.length > 500) {
			throw new ErrorHandler(400, "Message must be between 10 and 500 characters.");
		}
		if (name.length < 2 || name.length > 50) {
			throw new ErrorHandler(400, "Name must be between 2 and 50 characters.");
		}
		if (subject.length < 2 || subject.length > 100) {
			throw new ErrorHandler(400, "Subject must be between 2 and 100 characters.");
		}

		const newContact = ContactModel.create({
			name,
			email,
			subject,
			message,
		});
		if (!newContact) {
			throw new ErrorHandler(500, "Failed to create contact message.");
		}

		res.status(201).json({
			success: true,
			message: "Contact message created successfully",
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Internal Server Error");
	}
};

export const getAllContacts = async (req: Request, res: Response) => {
	try {
		const contacts = await ContactModel.find().sort({ createdAt: -1 });
		if (!contacts || contacts.length === 0) {
			throw new ErrorHandler(404, "No contact messages found.");
		}
		res.status(200).json({
			success: true,
			message: "Contact messages retrieved successfully",
			data: contacts,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Internal Server Error");
	}
};

export const deleteContact = async (req: Request, res: Response) => {
	const contactId = req.params.id;
	if (!contactId) {
		throw new ErrorHandler(400, "Contact ID is required");
	}
	if (mongoose.Types.ObjectId.isValid(contactId) === false) {
		throw new ErrorHandler(400, "Invalid contact ID format");
	}

	try {
		const deletedContact = await ContactModel.findByIdAndDelete(contactId);
		if (!deletedContact) {
			throw new ErrorHandler(404, "Contact message not found");
		}
		res.status(200).json({
			success: true,
			message: "Contact message deleted successfully",
			data: deletedContact,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Internal Server Error");
	}
};

export const getContactById = async (req: Request, res: Response) => {
	const contactId = req.params.id;
	if (!contactId) {
		throw new ErrorHandler(400, "Contact ID is required");
	}
	if (!mongoose.Types.ObjectId.isValid(contactId)) {
		throw new ErrorHandler(400, "Invalid contact ID format");
	}

	try {
		const contact = await ContactModel.findById(contactId);
		if (!contact) {
			throw new ErrorHandler(404, "Contact message not found");
		}
		res.status(200).json({
			success: true,
			message: "Contact message retrieved successfully",
			data: contact,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Internal Server Error");
	}
};
