import { Request, Response } from "express";
import { PackageModel, IPackage } from "@/models/package.model";
import { ErrorHandler } from "@/middlewares/error-handler.middleware";
import mongoose from "mongoose";

const createPackage = async (req: Request, res: Response): Promise<void> => {
	const {
		title,
		location,
		duration,
		price,
		originalPrice,
		rating,
		reviews,
		images,
		features,
		discount,
		description,
		highlights,
		itinerary,
		inclusions,
		exclusions,
		category,
	} = req.body as IPackage;
	if (
		!title ||
		!location ||
		!duration ||
		!price ||
		!originalPrice ||
		!rating ||
		!reviews ||
		!images ||
		!features ||
		!discount ||
		!description ||
		!highlights ||
		!itinerary ||
		!inclusions ||
		!exclusions ||
		!category
	) {
		throw new ErrorHandler(400, "All fields are required");
	}
	if (typeof price !== "number" || price < 0) {
		throw new ErrorHandler(400, "Price must be a positive number");
	}
	if (typeof originalPrice !== "number" || originalPrice < 0) {
		throw new ErrorHandler(400, "Original price must be a positive number");
	}
	if (typeof rating !== "number" || rating < 0 || rating > 5) {
		throw new ErrorHandler(400, "Rating must be between 0 and 5");
	}

	try {
		const newPackage = await PackageModel.create({
			title,
			location,
			duration,
			price,
			originalPrice,
			rating,
			reviews,
			images,
			features,
			discount,
			description,
			highlights,
			itinerary,
			inclusions,
			exclusions,
			category,
		});
		if (!newPackage) {
			throw new Error("Package creation failed");
		}

		res.status(201).json({
			success: true,
			package: newPackage,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Error creating package");
	}
};

const getAllPackages = async (_req: Request, res: Response): Promise<void> => {
	try {
		const packages = await PackageModel.find();
		if (!packages || packages.length === 0) {
			throw new ErrorHandler(404, "No packages found");
		}

		res.status(200).json({
			success: true,
			packages,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Error fetching packages");
	}
};

const getPackageById = async (req: Request, res: Response): Promise<void> => {
	const packageId = req.params.id;
	if (!packageId) {
		throw new ErrorHandler(400, "Package ID is required");
	}

	// Handle special route case
	if (packageId === "popular") {
		return gettingPopularPackages(req, res);
	}

	if (!mongoose.Types.ObjectId.isValid(packageId)) {
		throw new ErrorHandler(400, "Invalid package ID format");
	}

	try {
		const packageData = await PackageModel.findById(packageId);

		if (!packageData) {
			throw new ErrorHandler(404, "Package not found");
		}

		if (packageData.isDeleted) {
			throw new ErrorHandler(410, "Package has been deleted");
		}

		res.status(200).json({
			success: true,
			package: packageData,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Error fetching package by ID");
	}
};

const getPackageByState = async (req: Request, res: Response): Promise<void> => {
	const state = req.params.state;
	if (!state) {
		throw new ErrorHandler(400, "State is required");
	}

	try {
		const packages = await PackageModel.find({ "location.state": state });

		if (!packages || packages.length === 0) {
			throw new ErrorHandler(404, "No packages found for the specified state");
		}

		res.status(200).json({
			success: true,
			packages,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Error fetching packages by state");
	}
};

const updatePackage = async (req: Request, res: Response): Promise<void> => {
	const packageId = req.params.id;
	if (!packageId) {
		throw new ErrorHandler(400, "Package ID is required");
	}

	const updateData = req.body as Partial<IPackage>;
	if (Object.keys(updateData).length === 0) {
		throw new ErrorHandler(400, "No fields to update");
	}

	try {
		const updatedPackage = await PackageModel.findByIdAndUpdate(packageId, updateData, {
			new: true,
			runValidators: true,
		});

		if (!updatedPackage) {
			throw new ErrorHandler(404, "Package not found");
		}

		res.status(200).json({
			success: true,
			package: updatedPackage,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Error updating package");
	}
};

const deletePackage = async (req: Request, res: Response): Promise<void> => {
	const packageId = req.params.id;
	if (!packageId) {
		throw new ErrorHandler(400, "Package ID is required");
	}

	try {
		const deletedPackage = await PackageModel.findByIdAndDelete(packageId, { isDeleted: true });

		if (!deletedPackage) {
			throw new ErrorHandler(404, "Package not found");
		}

		res.status(200).json({
			success: true,
			message: "Package deleted successfully",
			package: deletedPackage,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Error deleting package");
	}
};

const gettingPopularPackages = async (_req: Request, res: Response): Promise<void> => {
	try {
		const packages = await PackageModel.find().sort({ rating: -1 }).limit(5);
		if (!packages || packages.length === 0) {
			throw new ErrorHandler(404, "No popular packages found");
		}

		res.status(200).json({
			success: true,
			packages,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Error fetching popular packages");
	}
};
export {
	createPackage,
	getAllPackages,
	getPackageById,
	getPackageByState,
	updatePackage,
	deletePackage,
	gettingPopularPackages,
};
