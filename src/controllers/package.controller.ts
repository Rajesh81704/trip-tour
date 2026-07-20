/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { PackageModel, IPackage } from "@/models/package.model";
import { ErrorHandler } from "@/middlewares/error-handler.middleware";
import mongoose from "mongoose";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/cloudinary";

// ─── Create ──────────────────────────────────────────────────────────────────
const createPackage = async (req: Request, res: Response): Promise<void> => {
	const formData = req.body;
	const {
		title, description, location, duration, features,
		highlights, price, discount, itinerary, inclusions, exclusions, category,
		flights, hotels,
	} = formData;

	let images: { url: string; public_id: string }[] = [];
	let flightImages: { [key: number]: { url: string; public_id: string } } = {};
	let hotelImages: { [key: number]: { url: string; public_id: string } } = {};

	if (req.files && Array.isArray(req.files)) {
		try {
			const uploadPromises = req.files.map((file: Express.Multer.File) => uploadToCloudinary(file));
			const uploadedResults = await Promise.all(uploadPromises);
			
			// Process uploaded files
			for (let i = 0; i < req.files.length; i++) {
				const file = req.files[i];
				const result = uploadedResults[i];

				if (result.url && result.public_id) {
					const imageData = { url: result.url as string, public_id: result.public_id as string };
					
					// Check if this is a flight image
					if (file.fieldname.startsWith("flight_image_")) {
						const flightIndex = parseInt(file.fieldname.split("_")[2]);
						flightImages[flightIndex] = imageData;
					}
					// Check if this is a hotel image
					else if (file.fieldname.startsWith("hotel_image_")) {
						const hotelIndex = parseInt(file.fieldname.split("_")[2]);
						hotelImages[hotelIndex] = imageData;
					}
					// Otherwise it's a package image
					else {
						images.push(imageData);
					}
				}
			}
		} catch {
			throw new ErrorHandler(500, "Error uploading images to Cloudinary");
		}
	}

	let parsedLocation, parsedDuration, parsedFeatures, parsedHighlights,
		parsedItinerary, parsedInclusions, parsedExclusions, parsedFlights, parsedHotels;

	try {
		parsedLocation   = typeof location   === "string" ? JSON.parse(location)   : location;
		parsedDuration   = typeof duration   === "string" ? JSON.parse(duration)   : duration;
		parsedFeatures   = typeof features   === "string" ? JSON.parse(features)   : features;
		parsedHighlights = typeof highlights === "string" ? JSON.parse(highlights) : highlights;
		parsedItinerary  = typeof itinerary  === "string" ? JSON.parse(itinerary)  : itinerary;
		parsedInclusions = typeof inclusions === "string" ? JSON.parse(inclusions) : inclusions;
		parsedExclusions = typeof exclusions === "string" ? JSON.parse(exclusions) : exclusions;
		parsedFlights    = typeof flights    === "string" ? JSON.parse(flights)    : (flights || []);
		parsedHotels     = typeof hotels     === "string" ? JSON.parse(hotels)     : (hotels || []);
	} catch {
		throw new ErrorHandler(400, "Invalid JSON format in form data");
	}

	const requiredFields = {
		title, parsedLocation, parsedDuration, price, parsedFeatures, discount,
		description, parsedHighlights, parsedItinerary, parsedInclusions, parsedExclusions, category,
	};

	for (const [field, value] of Object.entries(requiredFields)) {
		if (value === undefined || value === null || value === "")
			throw new ErrorHandler(400, `${field.replace("parsed", "")} is required`);
	}

	if (!images || images.length === 0) throw new ErrorHandler(400, "At least one image is required");
	if (!parsedLocation.city || !parsedLocation.state || !parsedLocation.destination)
		throw new ErrorHandler(400, "Location must include city, state, and destination");
	if (!parsedDuration.day) throw new ErrorHandler(400, "Duration must include day");
	if (Number(price) < 0) throw new ErrorHandler(400, "Price must be a positive number");

	try {
		// Add flight images to flights array
		const flightsWithImages = (parsedFlights || []).map((flight: any, index: number) => ({
			...flight,
			image: flightImages[index] || flight.image,
		}));

		// Add hotel images to hotels array
		const hotelsWithImages = (parsedHotels || []).map((hotel: any, index: number) => ({
			...hotel,
			image: hotelImages[index] || hotel.image,
		}));

		const newPackage = await PackageModel.create({
			title, location: parsedLocation, description,
			duration: parsedDuration, price: Number(price), reviews: [],
			images, features: parsedFeatures, discount: Number(discount),
			highlights: parsedHighlights, itinerary: parsedItinerary,
			inclusions: parsedInclusions, exclusions: parsedExclusions, category,
			flights: flightsWithImages,
			hotels: hotelsWithImages,
		});

		res.status(201).json({ success: true, package: newPackage });
	} catch (error) {
		if (error instanceof Error) throw new ErrorHandler(400, error.message);
		throw new ErrorHandler(500, "Error creating package");
	}
};

// ─── Get All (with full filtering, sorting, pagination) ──────────────────────
const getAllPackages = async (req: Request, res: Response): Promise<void> => {
	console.log("[getAllPackages] Request received with query:", req.query);
	
	const {
		state, city, destination, category, search,
		minPrice, maxPrice, minDays, maxDays,
		onSale,
		sortBy = "newest",
		page = "1", limit = "20",
	} = req.query as Record<string, string>;

	const filter: Record<string, any> = {};

	// ── Location filters ──────────────────────────────────────────────────────
	if (state) filter["location.state"] = { $regex: new RegExp(String(state).replace(/-/g, " "), "i") };
	if (city)  filter["location.city"]  = { $regex: new RegExp(String(city).replace(/-/g, " "),  "i") };
	if (destination) filter["location.destination"] = { $regex: new RegExp(String(destination).replace(/-/g, " "), "i") };

	// ── Category filter ───────────────────────────────────────────────────────
	if (category && category !== "all") {
		filter.category = { $regex: new RegExp(String(category).replace(/-/g, " "), "i") };
	}

	// ── Price range ───────────────────────────────────────────────────────────
	if (minPrice || maxPrice) {
		filter.price = {};
		if (minPrice) filter.price.$gte = Number(minPrice);
		if (maxPrice) filter.price.$lte = Number(maxPrice);
	}

	// ── Duration filter (days) ────────────────────────────────────────────────
	if (minDays || maxDays) {
		filter["duration.day"] = {};
		if (minDays) filter["duration.day"].$gte = Number(minDays);
		if (maxDays) filter["duration.day"].$lte = Number(maxDays);
	}

	// ── On sale (has discount > 0) ────────────────────────────────────────────
	if (onSale === "true") filter.discount = { $gt: 0 };

	// ── Full-text search ──────────────────────────────────────────────────────
	if (search) {
		const searchRegex = new RegExp(String(search).replace(/[-\s]+/g, ".*"), "i");
		filter.$or = [
			{ title:                    { $regex: searchRegex } },
			{ description:              { $regex: searchRegex } },
			{ "location.state":         { $regex: searchRegex } },
			{ "location.city":          { $regex: searchRegex } },
			{ "location.destination":   { $regex: searchRegex } },
			{ category:                 { $regex: searchRegex } },
			{ features:                 { $regex: searchRegex } },
			{ highlights:               { $regex: searchRegex } },
			{ "itinerary.title":        { $regex: searchRegex } },
			{ "itinerary.description":  { $regex: searchRegex } },
			{ inclusions:               { $regex: searchRegex } },
			{ exclusions:               { $regex: searchRegex } },
		];
	}

	// ── Sort ──────────────────────────────────────────────────────────────────
	const sortMap: Record<string, Record<string, 1 | -1>> = {
		newest:       { createdAt: -1 },
		oldest:       { createdAt: 1 },
		"price-asc":  { price: 1 },
		"price-desc": { price: -1 },
		popular:      { viewCount: -1 },
		discount:     { discount: -1 },
	};
	const sort = sortMap[sortBy] ?? sortMap.newest;

	// ── Pagination ────────────────────────────────────────────────────────────
	const pageNum  = Math.max(1, Number(page));
	const limitNum = Math.min(100, Math.max(1, Number(limit)));
	const skip     = (pageNum - 1) * limitNum;

	console.log("[getAllPackages] Filter:", filter);
	console.log("[getAllPackages] Sort:", sort);
	console.log("[getAllPackages] Pagination - Page:", pageNum, "Limit:", limitNum, "Skip:", skip);

	const [packages, total] = await Promise.all([
		PackageModel.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
		PackageModel.countDocuments(filter),
	]);

	console.log("[getAllPackages] Found packages:", packages.length, "Total:", total);

	res.status(200).json({
		success: true,
		packages,
		pagination: {
			total,
			page: pageNum,
			limit: limitNum,
			pages: Math.ceil(total / limitNum),
			hasNext: pageNum * limitNum < total,
			hasPrev: pageNum > 1,
		},
	});
};

// ─── Filter Meta — distinct values for populating sidebar ────────────────────
const getFilterMeta = async (_req: Request, res: Response): Promise<void> => {
	const [categories, states, priceRange] = await Promise.all([
		PackageModel.distinct("category"),
		PackageModel.distinct("location.state"),
		PackageModel.aggregate([
			{
				$group: {
					_id: null,
					minPrice: { $min: "$price" },
					maxPrice: { $max: "$price" },
					minDays:  { $min: "$duration.day" },
					maxDays:  { $max: "$duration.day" },
				},
			},
		]),
	]);

	res.status(200).json({
		success: true,
		filters: {
			categories: categories.filter(Boolean).sort(),
			states: states.filter(Boolean).sort(),
			priceRange: priceRange[0]
				? {
					min: priceRange[0].minPrice,
					max: priceRange[0].maxPrice,
					minDays: priceRange[0].minDays,
					maxDays: priceRange[0].maxDays,
				  }
				: { min: 0, max: 100000, minDays: 1, maxDays: 30 },
		},
	});
};

// ─── Get by ID (increments viewCount) ────────────────────────────────────────
const getPackageById = async (req: Request, res: Response): Promise<void> => {
	const packageId = req.params.id;
	if (!packageId) throw new ErrorHandler(400, "Package ID is required");
	if (!mongoose.Types.ObjectId.isValid(packageId)) throw new ErrorHandler(400, "Invalid package ID format");

	const packageData = await PackageModel.findByIdAndUpdate(
		packageId,
		{ $inc: { viewCount: 1 } },
		{ new: true },
	).lean();

	if (!packageData) throw new ErrorHandler(404, "Package not found");

	const { ReviewModel } = await import("../models/review.model");
	const reviews = await ReviewModel.find({ package: packageId })
		.populate("user", "name email")
		.sort({ createdAt: -1 });

	res.status(200).json({ success: true, package: packageData, reviews });
};

// ─── Popular ──────────────────────────────────────────────────────────────────
const gettingPopularPackages = async (req: Request, res: Response): Promise<void> => {
	const limitNum = Math.min(20, Math.max(1, Number(req.query.limit ?? 6)));
	const packages = await PackageModel.find()
		.sort({ viewCount: -1, createdAt: -1 })
		.limit(limitNum)
		.lean();

	res.status(200).json({ success: true, packages });
};

// ─── Update ───────────────────────────────────────────────────────────────────
const updatePackage = async (req: Request, res: Response): Promise<void> => {
	const packageId = req.params.id;
	if (!packageId) throw new ErrorHandler(400, "Package ID is required");

	const existingPackage = await PackageModel.findById(packageId);
	if (!existingPackage) throw new ErrorHandler(404, "Package not found");

	const updateData = { ...req.body } as Partial<IPackage>;

	let flightImages: { [key: number]: { url: string; public_id: string } } = {};
	let hotelImages: { [key: number]: { url: string; public_id: string } } = {};
	let packageImages: { url: string; public_id: string }[] = [];

	if (req.files && Array.isArray(req.files) && req.files.length > 0) {
		try {
			const uploadPromises = req.files.map((f: Express.Multer.File) => uploadToCloudinary(f));
			const uploadedResults = await Promise.all(uploadPromises);
			
			// Process uploaded files
			for (let i = 0; i < req.files.length; i++) {
				const file = req.files[i];
				const result = uploadedResults[i];

				if (result.url && result.public_id) {
					const imageData = { url: result.url as string, public_id: result.public_id as string };
					
					// Check if this is a flight image
					if (file.fieldname.startsWith("flight_image_")) {
						const flightIndex = parseInt(file.fieldname.split("_")[2]);
						flightImages[flightIndex] = imageData;
					}
					// Check if this is a hotel image
					else if (file.fieldname.startsWith("hotel_image_")) {
						const hotelIndex = parseInt(file.fieldname.split("_")[2]);
						hotelImages[hotelIndex] = imageData;
					}
					// Otherwise it's a package image
					else {
						packageImages.push(imageData);
					}
				}
			}
			
			// Update package images if new ones were uploaded
			if (packageImages.length > 0) {
				updateData.images = packageImages;
			} else {
				updateData.images = existingPackage.images;
			}
		} catch {
			throw new ErrorHandler(500, "Error uploading images to Cloudinary");
		}
	} else {
		updateData.images = existingPackage.images;
	}

	const fieldsToParse = ["location", "duration", "features", "highlights", "itinerary", "inclusions", "exclusions", "flights", "hotels"];
	for (const field of fieldsToParse) {
		const val = updateData[field as keyof IPackage];
		if (val && typeof val === "string") {
			try {
				(updateData as Record<string, unknown>)[field] = JSON.parse(val);
			} catch {
				throw new ErrorHandler(400, `Invalid JSON format in ${field} field`);
			}
		}
	}

	// Add flight images to flights
	if (updateData.flights && Array.isArray(updateData.flights)) {
		updateData.flights = (updateData.flights as any[]).map((flight: any, index: number) => ({
			...flight,
			image: flightImages[index] || flight.image,
		}));
	}

	// Add hotel images to hotels
	if (updateData.hotels && Array.isArray(updateData.hotels)) {
		updateData.hotels = (updateData.hotels as any[]).map((hotel: any, index: number) => ({
			...hotel,
			image: hotelImages[index] || hotel.image,
		}));
	}

	if (updateData.price)    updateData.price    = Number(updateData.price);
	if (updateData.discount) updateData.discount = Number(updateData.discount);

	const updatedPackage = await PackageModel.findByIdAndUpdate(packageId, updateData, {
		new: true, runValidators: true,
	});

	if (!updatedPackage) throw new ErrorHandler(404, "Package not found");
	res.status(200).json({ success: true, package: updatedPackage });
};

// ─── Delete ───────────────────────────────────────────────────────────────────
const deletePackage = async (req: Request, res: Response): Promise<void> => {
	const packageId = req.params.id;
	if (!packageId) throw new ErrorHandler(400, "Package ID is required");

	const packageToDelete = await PackageModel.findById(packageId);
	if (!packageToDelete) throw new ErrorHandler(404, "Package not found");

	if (packageToDelete.images?.length) {
		await Promise.all(packageToDelete.images.map((img: { public_id: string }) =>
			deleteFromCloudinary(img.public_id),
		));
	}

	await PackageModel.findByIdAndDelete(packageId);
	res.status(200).json({ success: true, message: "Package deleted successfully" });
};

export {
	createPackage,
	getAllPackages,
	getFilterMeta,
	getPackageById,
	gettingPopularPackages,
	updatePackage,
	deletePackage,
};
