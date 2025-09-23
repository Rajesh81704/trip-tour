import { Request, Response } from "express";
import { PackageModel, IPackage } from "@/models/package.model";
import { ErrorHandler } from "@/middlewares/error-handler.middleware";
import mongoose from "mongoose";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/cloudinary";

const createPackage = async (req: Request, res: Response): Promise<void> => {
	const formData = req.body;
	const {
		title,
		description,
		location,
		duration,
		features,
		highlights,
		price,
		discount,
		itinerary,
		inclusions,
		exclusions,
		category,
	} = formData;

	let images: { url: string; public_id: string }[] = [];
	if (req.files && Array.isArray(req.files)) {
		try {
			const uploadPromises = req.files.map(async (file: Express.Multer.File) => {
				const result = await uploadToCloudinary(file);
				return result;
			});

			const uploadedResults = await Promise.all(uploadPromises);
			images = uploadedResults
				.filter((result) => result.url !== null && result.public_id !== null)
				.map((result) => ({
					url: result.url as string,
					public_id: result.public_id as string,
				}));
		} catch {
			throw new ErrorHandler(500, "Error uploading images to Cloudinary");
		}
	}

	let parsedLocation,
		parsedDuration,
		parsedFeatures,
		parsedHighlights,
		parsedItinerary,
		parsedInclusions,
		parsedExclusions;

	try {
		parsedLocation = typeof location === "string" ? JSON.parse(location) : location;
		parsedDuration = typeof duration === "string" ? JSON.parse(duration) : duration;
		parsedFeatures = typeof features === "string" ? JSON.parse(features) : features;
		parsedHighlights = typeof highlights === "string" ? JSON.parse(highlights) : highlights;
		parsedItinerary = typeof itinerary === "string" ? JSON.parse(itinerary) : itinerary;
		parsedInclusions = typeof inclusions === "string" ? JSON.parse(inclusions) : inclusions;
		parsedExclusions = typeof exclusions === "string" ? JSON.parse(exclusions) : exclusions;
	} catch {
		throw new ErrorHandler(400, "Invalid JSON format in form data");
	}

	const requiredFields = {
		title,
		parsedLocation,
		parsedDuration,
		price,
		parsedFeatures,
		discount,
		description,
		parsedHighlights,
		parsedItinerary,
		parsedInclusions,
		parsedExclusions,
		category,
	};

	for (const [field, value] of Object.entries(requiredFields)) {
		if (!value) {
			const fieldName = field.replace("parsed", "");
			throw new ErrorHandler(400, `${fieldName} is required`);
		}
	}

	if (!images || images.length === 0) {
		throw new ErrorHandler(400, "At least one image is required");
	}

	if (!parsedLocation.city || !parsedLocation.state || !parsedLocation.destination) {
		throw new ErrorHandler(400, "Location must include city, state, and destination");
	}

	if (!parsedDuration.day) {
		throw new ErrorHandler(400, "Duration must include day");
	}

	if (typeof Number(price) !== "number" || Number(price) < 0) {
		throw new ErrorHandler(400, "Price must be a positive number");
	}

	try {
		const newPackage = await PackageModel.create({
			title,
			location: parsedLocation,
			description,
			duration: parsedDuration,
			price: Number(price),
			reviews: [],
			images,
			features: parsedFeatures,
			discount: Number(discount),
			highlights: parsedHighlights,
			itinerary: parsedItinerary,
			inclusions: parsedInclusions,
			exclusions: parsedExclusions,
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
const getAllPackages = async (req: Request, res: Response): Promise<void> => {
	try {
		const { state, city, destination, category, minPrice, maxPrice, search } = req.query;

		// Build filter object based on query parameters
		const filter: any = {};

		if (state) {
			const stateQuery = String(state).toLowerCase().replace(/-/g, " "); // Replace hyphens with spaces
			filter["location.state"] = { $regex: new RegExp(stateQuery, "i") };
		}
		if (city) {
			const cityQuery = String(city).toLowerCase().replace(/-/g, " ");
			filter["location.city"] = { $regex: new RegExp(cityQuery, "i") };
		}
		if (destination) {
			const destinationQuery = String(destination).toLowerCase().replace(/-/g, " ");
			filter["location.destination"] = { $regex: new RegExp(destinationQuery, "i") };
		}
		if (category) {
			const categoryQuery = String(category).toLowerCase().replace(/-/g, " ");
			filter.category = { $regex: new RegExp(categoryQuery, "i") };
		}

		if (minPrice || maxPrice) {
			filter.price = {};
			if (minPrice) filter.price.$gte = Number(minPrice);
			if (maxPrice) filter.price.$lte = Number(maxPrice);
		}

		if (search) {
			const searchQuery = String(search)
				.toLowerCase()
				.replace(/[-\s]+/g, ".*"); // Make search more flexible
			const searchRegex = new RegExp(searchQuery, "i");
			filter.$or = [
				{ title: { $regex: searchRegex } },
				{ description: { $regex: searchRegex } },
				{ "location.state": { $regex: searchRegex } },
				{ "location.city": { $regex: searchRegex } },
				{ "location.destination": { $regex: searchRegex } },
				{ category: { $regex: searchRegex } },
				{ features: { $regex: searchRegex } },
				{ highlights: { $regex: searchRegex } },
				{ "itinerary.title": { $regex: searchRegex } },
				{ "itinerary.description": { $regex: searchRegex } },
				{ inclusions: { $regex: searchRegex } },
				{ exclusions: { $regex: searchRegex } },
			];
		}

		const packages = await PackageModel.find(filter);

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

	if (!mongoose.Types.ObjectId.isValid(packageId)) {
		throw new ErrorHandler(400, "Invalid package ID format");
	}

	try {
		const packageData = await PackageModel.findById(packageId).lean();

		if (!packageData) {
			throw new ErrorHandler(404, "Package not found");
		}

		const { ReviewModel } = await import("../models/review.model");
		const reviews = await ReviewModel.find({ package: packageId })
			.populate("user", "name email")
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			package: packageData,
			reviews,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Error fetching package by ID");
	}
};

const updatePackage = async (req: Request, res: Response): Promise<void> => {
	const packageId = req.params.id;
	if (!packageId) {
		throw new ErrorHandler(400, "Package ID is required");
	}

	const formData = req.body;
	const updateData = { ...formData } as Partial<IPackage>;

	// First get existing package to preserve images if no new ones uploaded
	const existingPackage = await PackageModel.findById(packageId);
	if (!existingPackage) {
		throw new ErrorHandler(404, "Package not found");
	}

	// Handle image updates if files are present
	if (req.files && Array.isArray(req.files) && req.files.length > 0) {
		try {
			const uploadPromises = req.files.map(async (file: Express.Multer.File) => {
				const result = await uploadToCloudinary(file);
				return result;
			});

			const uploadedResults = await Promise.all(uploadPromises);
			const newImages = uploadedResults
				.filter((result) => result.url !== null && result.public_id !== null)
				.map((result) => ({
					url: result.url as string,
					public_id: result.public_id as string,
				}));
			updateData.images = newImages;
		} catch {
			throw new ErrorHandler(500, "Error uploading images to Cloudinary");
		}
	} else {
		// Keep existing images if no new ones uploaded
		updateData.images = existingPackage.images;
	}

	// Parse JSON strings to objects/arrays for complex fields
	const fieldsToParse = [
		"location",
		"duration",
		"features",
		"highlights",
		"itinerary",
		"inclusions",
		"exclusions",
	];

	for (const field of fieldsToParse) {
		if (
			updateData[field as keyof IPackage] &&
			typeof updateData[field as keyof IPackage] === "string"
		) {
			try {
				(updateData as Record<string, unknown>)[field] = JSON.parse(
					updateData[field as keyof IPackage] as string,
				);
			} catch {
				throw new ErrorHandler(400, `Invalid JSON format in ${field} field`);
			}
		}
	}

	if (Object.keys(updateData).length === 0) {
		throw new ErrorHandler(400, "No fields to update");
	}

	// Convert price and discount fields to numbers if they exist
	if (updateData.price) updateData.price = Number(updateData.price);
	if (updateData.discount) updateData.discount = Number(updateData.discount);

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
		const packageToDelete = await PackageModel.findById(packageId);
		if (!packageToDelete) {
			throw new ErrorHandler(404, "Package not found");
		}

		// Delete images from Cloudinary if they exist
		if (packageToDelete.images && packageToDelete.images.length > 0) {
			const deletePromises = packageToDelete.images.map(async (image: { public_id: string }) => {
				await deleteFromCloudinary(image.public_id);
			});
			await Promise.all(deletePromises);
		}

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
	updatePackage,
	deletePackage,
	gettingPopularPackages,
};
