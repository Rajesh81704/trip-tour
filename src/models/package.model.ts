import mongoose, { Document, Types } from "mongoose";

interface IFlightOption {
	type: "main" | "internal";
	airline: string;
	flightNumber: string;
	departureCity: string;
	departureAirport: string;
	departureTime: string;
	departureDate: string;
	arrivalCity: string;
	arrivalAirport: string;
	arrivalTime: string;
	arrivalDate: string;
	duration: string;
	class: "economy" | "business" | "first";
	price: number;
	description?: string;
	image?: { url: string; public_id: string };
}

interface IHotelOption {
	location: string;
	hotelName: string;
	nights: number;
	roomType: string;
	amenities: string[];
	/** Multiple hotel images */
	images?: { url: string; public_id: string }[];
	/** Keep legacy single-image field for backwards compat */
	image?: { url: string; public_id: string };
	price: number;
	description?: string;
	starRating?: number;
	checkInDate?: string;
	checkOutDate?: string;
}

interface ISightseeingOption {
	name: string;
	description?: string;
	location?: string;
	duration?: string;
	/** Multiple sightseeing images */
	images?: { url: string; public_id: string }[];
}

interface IItineraryDay {
	day: number;
	title: string;
	description: string;
	/** Optional hotel name for this day */
	hotelName?: string;
	/** Optional city for this day */
	city?: string;
}

interface IPackage extends Document {
	title: string;
	description: string;
	location: {
		city: string;
		state: string;
		destination: string;
	};
	duration: {
		day: number;
		night: number;
	};
	price: number;
	reviews: Types.ObjectId[];
	images: { url: string; public_id: string }[];
	features: string[];
	discount: number;
	highlights: string[];
	itinerary: IItineraryDay[];
	inclusions: string[];
	exclusions: string[];
	category: string;
	viewCount: number;
	flights?: IFlightOption[];
	hotels?: IHotelOption[];
	sightseeings?: ISightseeingOption[];
}

const packageSchema = new mongoose.Schema<IPackage>(
	{
		title:    { type: String, required: true },
		location: {
			city:        { type: String, required: true },
			state:       { type: String, required: true },
			destination: { type: String, required: true },
		},
		duration: {
			day:   { type: Number, required: true },
			night: { type: Number },
		},
		price:     { type: Number, required: true },
		discount:  { type: Number, required: true },
		viewCount: { type: Number, default: 0 },
		reviews:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
		images: {
			type: [{ url: { type: String, required: true }, public_id: { type: String, required: true } }],
			required: true,
		},
		features:    { type: [String], required: true },
		description: { type: String, required: true },
		highlights:  { type: [String], required: true },
		itinerary: {
			type: [
				{
					day:         { type: Number, required: true },
					title:       { type: String, required: true },
					description: { type: String, required: true },
					hotelName:   { type: String },
					city:        { type: String },
				},
			],
		},
		inclusions: { type: [String], required: true },
		exclusions: { type: [String], required: true },
		category:   { type: String, required: true },

		// ── Flights ────────────────────────────────────────────────────────────
		flights: {
			type: [
				{
					type:             { type: String, enum: ["main", "internal"], default: "main" },
					airline:          { type: String, default: "" },
					flightNumber:     { type: String, default: "" },
					departureCity:    { type: String, default: "" },
					departureAirport: { type: String, default: "" },
					departureTime:    { type: String, default: "" },
					departureDate:    { type: String, default: "" },
					arrivalCity:      { type: String, default: "" },
					arrivalAirport:   { type: String, default: "" },
					arrivalTime:      { type: String, default: "" },
					arrivalDate:      { type: String, default: "" },
					duration:         { type: String, default: "" },
					class:            { type: String, enum: ["economy", "business", "first"], default: "economy" },
					price:            { type: Number, default: 0 },
					description:      { type: String, default: "" },
					image:            { url: { type: String }, public_id: { type: String } },
				},
			],
			default: [],
		},

		// ── Hotels ─────────────────────────────────────────────────────────────
		hotels: {
			type: [
				{
					location:    { type: String, default: "" },
					hotelName:   { type: String, default: "" },
					nights:      { type: Number, default: 1 },
					roomType:    { type: String, default: "" },
					amenities:   { type: [String], default: [] },
					// Multiple images
					images: {
						type: [{ url: { type: String }, public_id: { type: String } }],
						default: [],
					},
					// Legacy single image
					image:       { url: { type: String }, public_id: { type: String } },
					price:       { type: Number, default: 0 },
					description: { type: String, default: "" },
					starRating:  { type: Number, min: 1, max: 5, default: 3 },
					checkInDate: { type: String, default: "" },
					checkOutDate:{ type: String, default: "" },
				},
			],
			default: [],
		},

		// ── Sightseeings ───────────────────────────────────────────────────────
		sightseeings: {
			type: [
				{
					name:        { type: String, default: "" },
					description: { type: String, default: "" },
					location:    { type: String, default: "" },
					duration:    { type: String, default: "" },
					images: {
						type: [{ url: { type: String }, public_id: { type: String } }],
						default: [],
					},
				},
			],
			default: [],
		},
	},
	{ timestamps: true },
);

// Indexes
packageSchema.index({ "location.state": 1 });
packageSchema.index({ "location.city": 1 });
packageSchema.index({ category: 1 });
packageSchema.index({ price: 1 });
packageSchema.index({ viewCount: -1 });
packageSchema.index({ createdAt: -1 });

const PackageModel = mongoose.models.Package || mongoose.model("Package", packageSchema);
export { PackageModel, IPackage, IFlightOption, IHotelOption, ISightseeingOption, IItineraryDay };
