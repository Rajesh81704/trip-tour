/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { PackageModel } from "@/models/package.model";
import { ReviewModel } from "@/models/review.model";
import { ErrorHandler } from "@/middlewares/error-handler.middleware";
import { deleteFromR2 } from "@/utils/r2";
import mongoose from "mongoose";

// ─── Helper: safely parse a JSON string or return the value as-is ────────────
function parseField<T>(value: unknown, fallback: T): T {
	if (typeof value === "string") {
		try { return JSON.parse(value) as T; } catch { return fallback; }
	}
	return (value as T) ?? fallback;
}

function sanitizeFlights(flights: any[]): any[] {
	if (!Array.isArray(flights)) return [];
	return flights.map((f) => ({
		type: f?.type === "internal" ? "internal" : "main",
		airline: String(f?.airline ?? "").trim(),
		flightNumber: String(f?.flightNumber ?? "").trim(),
		departureCity: String(f?.departureCity ?? "").trim(),
		departureAirport: String(f?.departureAirport ?? "").trim(),
		departureTime: String(f?.departureTime ?? "").trim(),
		departureDate: String(f?.departureDate ?? "").trim(),
		arrivalCity: String(f?.arrivalCity ?? "").trim(),
		arrivalAirport: String(f?.arrivalAirport ?? "").trim(),
		arrivalTime: String(f?.arrivalTime ?? "").trim(),
		arrivalDate: String(f?.arrivalDate ?? "").trim(),
		duration: String(f?.duration ?? "").trim(),
		class: ["economy", "business", "first"].includes(f?.class) ? f.class : "economy",
		price: Number(f?.price) || 0,
		description: String(f?.description ?? "").trim(),
		image: f?.image ?? undefined,
	}));
}

function sanitizeHotels(hotels: any[]): any[] {
	if (!Array.isArray(hotels)) return [];
	return hotels.map((h) => ({
		location: String(h?.location ?? "").trim(),
		hotelName: String(h?.hotelName ?? "").trim(),
		nights: Number(h?.nights) || 1,
		roomType: String(h?.roomType ?? "").trim(),
		amenities: Array.isArray(h?.amenities) ? h.amenities.map((a: any) => String(a).trim()).filter(Boolean) : [],
		images: Array.isArray(h?.images) ? h.images : [],
		image: h?.image ?? undefined,
		price: Number(h?.price) || 0,
		description: String(h?.description ?? "").trim(),
		starRating: Math.min(5, Math.max(1, Number(h?.starRating) || 3)),
		checkInDate: String(h?.checkInDate ?? "").trim(),
		checkOutDate: String(h?.checkOutDate ?? "").trim(),
	}));
}

function sanitizeSightseeings(sightseeings: any[]): any[] {
	if (!Array.isArray(sightseeings)) return [];
	return sightseeings.map((s) => ({
		name: String(s?.name ?? "").trim(),
		description: String(s?.description ?? "").trim(),
		location: String(s?.location ?? "").trim(),
		duration: String(s?.duration ?? "").trim(),
		images: Array.isArray(s?.images) ? s.images : [],
	}));
}

function fixImageUrl(img: { url: string; public_id: string }): { url: string; public_id: string } {
	if (!img) return img;
	const publicBase = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
	if (img.public_id && (img.url?.includes(".r2.dev") || !img.url?.startsWith("http"))) {
		return {
			...img,
			url: publicBase ? `${publicBase}/${img.public_id}` : `/api/proxy/upload/file/${img.public_id}`,
		};
	}
	return img;
}

export function fixPackageImages(pkg: any): any {
	if (!pkg) return pkg;
	const copy = typeof pkg.toObject === "function" ? pkg.toObject() : { ...pkg };
	if (Array.isArray(copy.images)) {
		copy.images = copy.images.map(fixImageUrl);
	}
	if (Array.isArray(copy.hotels)) {
		copy.hotels = copy.hotels.map((h: any) => ({
			...h,
			images: Array.isArray(h.images) ? h.images.map(fixImageUrl) : [],
			image: h.image ? fixImageUrl(h.image) : undefined,
		}));
	}
	if (Array.isArray(copy.sightseeings)) {
		copy.sightseeings = copy.sightseeings.map((s: any) => ({
			...s,
			images: Array.isArray(s.images) ? s.images.map(fixImageUrl) : [],
		}));
	}
	return copy;
}

// ─── Create ──────────────────────────────────────────────────────────────────
// Images are already uploaded to R2 by the browser — they arrive as a JSON
// array of { url, public_id } objects in req.body.images.
const createPackage = async (req: Request, res: Response): Promise<void> => {
	const b = req.body;

	const title       = b.title       as string;
	const description = b.description as string;
	const price       = Number(b.price);
	const discount    = Number(b.discount);
	const category    = b.category    as string;

	const location     = parseField<any>(b.location,     null);
	const duration     = parseField<any>(b.duration,     null);
	const features     = parseField<string[]>(b.features,    []);
	const highlights   = parseField<string[]>(b.highlights,  []);
	const itinerary    = parseField<any[]>(b.itinerary,   []);
	const inclusions   = parseField<string[]>(b.inclusions,  []);
	const exclusions   = parseField<string[]>(b.exclusions,  []);
	const flights      = sanitizeFlights(parseField<any[]>(b.flights,     []));
	const hotels       = sanitizeHotels(parseField<any[]>(b.hotels,      []));
	const sightseeings = sanitizeSightseeings(parseField<any[]>(b.sightseeings,[]));
	const images       = parseField<{ url: string; public_id: string }[]>(b.images, []);

	// Validation
	if (!title)       throw new ErrorHandler(400, "title is required");
	if (!description) throw new ErrorHandler(400, "description is required");
	if (!category)    throw new ErrorHandler(400, "category is required");
	if (isNaN(price) || price < 0) throw new ErrorHandler(400, "price must be a positive number");
	if (!location?.city || !location?.state || !location?.destination)
		throw new ErrorHandler(400, "location.city, location.state and location.destination are required");
	if (!duration?.day) throw new ErrorHandler(400, "duration.day is required");
	if (!images.length) throw new ErrorHandler(400, "At least one image is required");

	const newPackage = await PackageModel.create({
		title, description, location, duration,
		price, discount, category,
		features, highlights, itinerary,
		inclusions, exclusions,
		flights, hotels, sightseeings,
		images, reviews: [],
	});

	res.status(201).json({ success: true, package: newPackage });
};

// ─── Get All (with full filtering, sorting, pagination) ──────────────────────
const getAllPackages = async (req: Request, res: Response): Promise<void> => {
	const {
		state, city, destination, category, search,
		minPrice, maxPrice, minDays, maxDays,
		onSale, sortBy = "newest", page = "1", limit = "20",
	} = req.query as Record<string, string>;

	const filter: Record<string, any> = {};

	if (state)       filter["location.state"]       = { $regex: new RegExp(state.replace(/-/g, " "), "i") };
	if (city)        filter["location.city"]         = { $regex: new RegExp(city.replace(/-/g, " "), "i") };
	if (destination) filter["location.destination"]  = { $regex: new RegExp(destination.replace(/-/g, " "), "i") };
	if (category && category !== "all")
		filter.category = { $regex: new RegExp(category.replace(/-/g, " "), "i") };

	if (minPrice || maxPrice) {
		filter.price = {};
		if (minPrice) filter.price.$gte = Number(minPrice);
		if (maxPrice) filter.price.$lte = Number(maxPrice);
	}
	if (minDays || maxDays) {
		filter["duration.day"] = {};
		if (minDays) filter["duration.day"].$gte = Number(minDays);
		if (maxDays) filter["duration.day"].$lte = Number(maxDays);
	}
	if (onSale === "true") filter.discount = { $gt: 0 };

	if (search) {
		const r = new RegExp(search.replace(/[-\s]+/g, ".*"), "i");
		filter.$or = [
			{ title: { $regex: r } }, { description: { $regex: r } },
			{ "location.state": { $regex: r } }, { "location.city": { $regex: r } },
			{ "location.destination": { $regex: r } }, { category: { $regex: r } },
			{ features: { $regex: r } }, { highlights: { $regex: r } },
			{ "itinerary.title": { $regex: r } }, { inclusions: { $regex: r } },
		];
	}

	const sortMap: Record<string, Record<string, 1 | -1>> = {
		newest: { createdAt: -1 }, oldest: { createdAt: 1 },
		"price-asc": { price: 1 }, "price-desc": { price: -1 },
		popular: { viewCount: -1 }, discount: { discount: -1 },
	};
	const sort = sortMap[sortBy] ?? sortMap.newest;

	const pageNum  = Math.max(1, Number(page));
	const limitNum = Math.min(100, Math.max(1, Number(limit)));
	const skip     = (pageNum - 1) * limitNum;

	const [packages, total] = await Promise.all([
		PackageModel.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
		PackageModel.countDocuments(filter),
	]);

	res.status(200).json({
		success: true,
		packages: packages.map(fixPackageImages),
		pagination: {
			total, page: pageNum, limit: limitNum,
			pages: Math.ceil(total / limitNum),
			hasNext: pageNum * limitNum < total,
			hasPrev: pageNum > 1,
		},
	});
};

// ─── Filter Meta ─────────────────────────────────────────────────────────────
const getFilterMeta = async (_req: Request, res: Response): Promise<void> => {
	const [categories, states, priceRange] = await Promise.all([
		PackageModel.distinct("category"),
		PackageModel.distinct("location.state"),
		PackageModel.aggregate([{
			$group: {
				_id: null,
				minPrice: { $min: "$price" }, maxPrice: { $max: "$price" },
				minDays:  { $min: "$duration.day" }, maxDays:  { $max: "$duration.day" },
			},
		}]),
	]);

	res.status(200).json({
		success: true,
		filters: {
			categories: categories.filter(Boolean).sort(),
			states:     states.filter(Boolean).sort(),
			priceRange: priceRange[0]
				? { min: priceRange[0].minPrice, max: priceRange[0].maxPrice,
				    minDays: priceRange[0].minDays, maxDays: priceRange[0].maxDays }
				: { min: 0, max: 100000, minDays: 1, maxDays: 30 },
		},
	});
};

// ─── Get by ID (increments viewCount) ────────────────────────────────────────
const getPackageById = async (req: Request, res: Response): Promise<void> => {
	const packageId = req.params.id;
	if (!packageId) throw new ErrorHandler(400, "Package ID is required");
	if (!mongoose.Types.ObjectId.isValid(packageId)) throw new ErrorHandler(400, "Invalid package ID");

	const packageData = await PackageModel.findByIdAndUpdate(
		packageId, { $inc: { viewCount: 1 } }, { new: true },
	).lean();

	if (!packageData) throw new ErrorHandler(404, "Package not found");

	const reviews = await ReviewModel.find({ package: packageId })
		.populate("user", "name email").sort({ createdAt: -1 });

	res.status(200).json({ success: true, package: fixPackageImages(packageData), reviews });
};

// ─── Popular ──────────────────────────────────────────────────────────────────
const gettingPopularPackages = async (req: Request, res: Response): Promise<void> => {
	const limitNum = Math.min(20, Math.max(1, Number(req.query.limit ?? 6)));
	const packages = await PackageModel.find()
		.sort({ viewCount: -1, createdAt: -1 }).limit(limitNum).lean();
	res.status(200).json({ success: true, packages: packages.map(fixPackageImages) });
};

// ─── Update ───────────────────────────────────────────────────────────────────
// Images arrive pre-uploaded as JSON arrays — no file handling needed.
const updatePackage = async (req: Request, res: Response): Promise<void> => {
	const packageId = req.params.id;
	if (!packageId) throw new ErrorHandler(400, "Package ID is required");

	const existing = await PackageModel.findById(packageId);
	if (!existing) throw new ErrorHandler(404, "Package not found");

	const b = req.body;

	// Parse all JSON-stringified fields
	const updateData: Record<string, unknown> = {
		title:        b.title,
		description:  b.description,
		category:     b.category,
		price:        b.price != null    ? Number(b.price)    : existing.price,
		discount:     b.discount != null ? Number(b.discount) : existing.discount,
		location:     parseField(b.location,     existing.location),
		duration:     parseField(b.duration,     existing.duration),
		features:     parseField(b.features,     existing.features),
		highlights:   parseField(b.highlights,   existing.highlights),
		itinerary:    parseField(b.itinerary,    existing.itinerary),
		inclusions:   parseField(b.inclusions,   existing.inclusions),
		exclusions:   parseField(b.exclusions,   existing.exclusions),
		flights:      sanitizeFlights(parseField(b.flights,      existing.flights ?? [])),
		hotels:       sanitizeHotels(parseField(b.hotels,       existing.hotels  ?? [])),
		sightseeings: sanitizeSightseeings(parseField(b.sightseeings, (existing as any).sightseeings ?? [])),
		// Images: use incoming if provided, otherwise keep existing
		images:       parseField<{ url: string; public_id: string }[]>(
						b.images, null as any
					) || existing.images,
	};

	const updatedPackage = await PackageModel.findByIdAndUpdate(
		packageId, updateData, { new: true, runValidators: true },
	);

	if (!updatedPackage) throw new ErrorHandler(404, "Package not found");
	res.status(200).json({ success: true, package: updatedPackage });
};

// ─── Delete (also cleans up R2 images) ───────────────────────────────────────
const deletePackage = async (req: Request, res: Response): Promise<void> => {
	const packageId = req.params.id;
	if (!packageId) throw new ErrorHandler(400, "Package ID is required");

	const pkg = await PackageModel.findById(packageId);
	if (!pkg) throw new ErrorHandler(404, "Package not found");

	// Delete all images from R2
	const allKeys: string[] = [
		...(pkg.images ?? []).map((i: any) => i.public_id),
		...((pkg as any).hotels ?? []).flatMap((h: any) =>
			[...(h.images ?? []), h.image ? h.image : null].filter(Boolean).map((i: any) => i.public_id)
		),
		...((pkg as any).sightseeings ?? []).flatMap((s: any) =>
			(s.images ?? []).map((i: any) => i.public_id)
		),
	].filter(Boolean);

	if (allKeys.length) {
		await Promise.allSettled(allKeys.map((key) => deleteFromR2(key)));
	}

	await PackageModel.findByIdAndDelete(packageId);
	res.status(200).json({ success: true, message: "Package deleted successfully" });
};

export {
	createPackage, getAllPackages, getFilterMeta,
	getPackageById, gettingPopularPackages, updatePackage, deletePackage,
};
