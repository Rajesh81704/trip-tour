import mongoose, { Document, Schema } from "mongoose";

export type PresetType = "hotel" | "sightseeing" | "itinerary";

export interface IPresetImage {
	url: string;
	public_id: string;
}

export interface IPresetHotelData {
	hotelName: string;
	location?: string;
	starRating?: number;
	roomType?: string;
	amenities?: string[];
	price?: number;
	description?: string;
	images?: IPresetImage[];
}

export interface IPresetSightseeingData {
	name: string;
	description?: string;
	location?: string;
	duration?: string;
	images?: IPresetImage[];
}

export interface IPresetItineraryData {
	title: string;
	description: string;
	city?: string;
	hotelName?: string;
}

export interface IPreset extends Document {
	destination: string;
	city?: string;
	type: PresetType;
	data: IPresetHotelData | IPresetSightseeingData | IPresetItineraryData;
	createdAt: Date;
	updatedAt: Date;
}

const presetSchema = new Schema<IPreset>(
	{
		destination: { type: String, required: true, trim: true, index: true },
		city: { type: String, trim: true, default: "" },
		type: {
			type: String,
			enum: ["hotel", "sightseeing", "itinerary"],
			required: true,
			index: true,
		},
		data: {
			type: Schema.Types.Mixed,
			required: true,
		},
	},
	{ timestamps: true },
);

// Composite indexes for quick queries
presetSchema.index({ destination: 1, type: 1 });
presetSchema.index({ city: 1, type: 1 });

const PresetModel = mongoose.models.Preset || mongoose.model<IPreset>("Preset", presetSchema);

export { PresetModel };
