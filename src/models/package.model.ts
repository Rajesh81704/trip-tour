import mongoose, { Document, Types } from "mongoose";

interface IFlightOption {
	type: "main" | "internal"; // main for international, internal for domestic
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
	image?: {
		url: string;
		public_id: string;
	};
}

interface IHotelOption {
	location: string;
	hotelName: string;
	nights: number;
	roomType: string;
	amenities: string[];
	image?: {
		url: string;
		public_id: string;
	};
	price: number;
	description?: string;
	starRating?: number;
	checkInDate?: string;
	checkOutDate?: string;
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
	images: {
		url: string;
		public_id: string;
	}[];
	features: string[];
	discount: number;
	highlights: string[];
	itinerary: {
		day: number;
		title: string;
		description: string;
	}[];
	inclusions: string[];
	exclusions: string[];
	category: string;
	viewCount: number;
	flights?: IFlightOption[];
	hotels?: IHotelOption[];
}

const packageSchema = new mongoose.Schema<IPackage>(
	{
		title: { type: String, required: true },
		location: {
			city: { type: String, required: true },
			state: { type: String, required: true },
			destination: { type: String, required: true },
		},
		duration: {
			day: { type: Number, required: true },
			night: { type: Number },
		},
		price: { type: Number, required: true },
		discount: { type: Number, required: true },
		viewCount: { type: Number, default: 0 },
		reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
		images: {
			type: [
				{
					url: { type: String, required: true },
					public_id: { type: String, required: true },
				},
			],
			required: true,
		},
		features: { type: [String], required: true },
		description: { type: String, required: true },
		highlights: { type: [String], required: true },
		itinerary: {
			type: [
				{
					day: { type: Number, required: true },
					title: { type: String, required: true },
					description: { type: String, required: true },
				},
			],
		},
		inclusions: { type: [String], required: true },
		exclusions: { type: [String], required: true },
		category: { type: String, required: true },
		flights: {
			type: [
				{
					type: { type: String, enum: ["main", "internal"], required: true },
					airline: { type: String, required: true },
					flightNumber: { type: String, required: true },
					departureCity: { type: String, required: true },
					departureAirport: { type: String, required: true },
					departureTime: { type: String, required: true },
					departureDate: { type: String, required: true },
					arrivalCity: { type: String, required: true },
					arrivalAirport: { type: String, required: true },
					arrivalTime: { type: String, required: true },
					arrivalDate: { type: String, required: true },
					duration: { type: String, required: true },
					class: { type: String, enum: ["economy", "business", "first"], default: "economy" },
					price: { type: Number, required: true },
					description: { type: String },
					image: {
						url: { type: String },
						public_id: { type: String },
					},
				},
			],
			default: [],
		},
		hotels: {
			type: [
				{
					location: { type: String, required: true },
					hotelName: { type: String, required: true },
					nights: { type: Number, required: true },
					roomType: { type: String, required: true },
					amenities: { type: [String], default: [] },
					image: {
						url: { type: String },
						public_id: { type: String },
					},
					price: { type: Number, required: true },
					description: { type: String },
					starRating: { type: Number, min: 1, max: 5 },
					checkInDate: { type: String },
					checkOutDate: { type: String },
				},
			],
			default: [],
		},
	},
	{ timestamps: true },
);

// Indexes for efficient filtering
packageSchema.index({ "location.state": 1 });
packageSchema.index({ "location.city": 1 });
packageSchema.index({ category: 1 });
packageSchema.index({ price: 1 });
packageSchema.index({ viewCount: -1 });
packageSchema.index({ createdAt: -1 });

const PackageModel = mongoose.models.Package || mongoose.model("Package", packageSchema);
export { PackageModel, IPackage, IFlightOption, IHotelOption };
