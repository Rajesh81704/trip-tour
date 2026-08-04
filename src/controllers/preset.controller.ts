import { Request, Response } from "express";
import { PresetModel } from "@/models/preset.model";
import { logger } from "@/utils/logger";

/**
 * Create a new destination preset (Hotel, Sightseeing, or Itinerary)
 */
export const createPreset = async (req: Request, res: Response) => {
	try {
		const { destination, city, type, data } = req.body;

		if (!destination || !type || !data) {
			return res.status(400).json({ message: "destination, type, and data are required" });
		}

		if (!["hotel", "sightseeing", "itinerary"].includes(type)) {
			return res.status(400).json({ message: "type must be 'hotel', 'sightseeing', or 'itinerary'" });
		}

		const preset = await PresetModel.create({
			destination: destination.trim(),
			city: city ? city.trim() : "",
			type,
			data,
		});

		logger.info(`Preset created successfully [${type}] for ${destination}`);
		return res.status(201).json({ message: "Preset created successfully", data: preset });
	} catch (error) {
		logger.error("Failed to create preset:", error);
		return res.status(500).json({ message: "Internal server error creating preset" });
	}
};

/**
 * Get presets with optional filtering by destination, city, type, or search term
 */
export const getPresets = async (req: Request, res: Response) => {
	try {
		const { destination, city, type, search } = req.query;

		const filter: Record<string, any> = {};

		if (destination && typeof destination === "string" && destination.trim()) {
			filter.destination = { $regex: new RegExp(destination.trim(), "i") };
		}

		if (city && typeof city === "string" && city.trim()) {
			filter.city = { $regex: new RegExp(city.trim(), "i") };
		}

		if (type && typeof type === "string" && type.trim()) {
			filter.type = type.trim();
		}

		if (search && typeof search === "string" && search.trim()) {
			const searchRegex = new RegExp(search.trim(), "i");
			filter.$or = [
				{ destination: searchRegex },
				{ city: searchRegex },
				{ "data.hotelName": searchRegex },
				{ "data.name": searchRegex },
				{ "data.title": searchRegex },
				{ "data.description": searchRegex },
			];
		}

		const presets = await PresetModel.find(filter).sort({ createdAt: -1 }).lean();
		return res.status(200).json({ data: presets, count: presets.length });
	} catch (error) {
		logger.error("Failed to fetch presets:", error);
		return res.status(500).json({ message: "Internal server error fetching presets" });
	}
};

/**
 * Get distinct list of destinations that have presets
 */
export const getPresetDestinations = async (_req: Request, res: Response) => {
	try {
		const destinations = await PresetModel.distinct("destination");
		const sorted = destinations.filter(Boolean).sort((a, b) => a.localeCompare(b));
		return res.status(200).json({ data: sorted });
	} catch (error) {
		logger.error("Failed to fetch preset destinations:", error);
		return res.status(500).json({ message: "Internal server error fetching destinations" });
	}
};

/**
 * Get a single preset by ID
 */
export const getPresetById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const preset = await PresetModel.findById(id).lean();
		if (!preset) {
			return res.status(404).json({ message: "Preset not found" });
		}
		return res.status(200).json({ data: preset });
	} catch (error) {
		logger.error("Failed to fetch preset by id:", error);
		return res.status(500).json({ message: "Internal server error fetching preset" });
	}
};

/**
 * Update a preset by ID
 */
export const updatePreset = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { destination, city, type, data } = req.body;

		const updateFields: Record<string, any> = {};
		if (destination) updateFields.destination = destination.trim();
		if (city !== undefined) updateFields.city = city.trim();
		if (type) updateFields.type = type;
		if (data) updateFields.data = data;

		const preset = await PresetModel.findByIdAndUpdate(id, updateFields, { new: true }).lean();
		if (!preset) {
			return res.status(404).json({ message: "Preset not found" });
		}

		logger.info(`Preset updated successfully [${id}]`);
		return res.status(200).json({ message: "Preset updated successfully", data: preset });
	} catch (error) {
		logger.error("Failed to update preset:", error);
		return res.status(500).json({ message: "Internal server error updating preset" });
	}
};

/**
 * Delete a preset by ID
 */
export const deletePreset = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const preset = await PresetModel.findByIdAndDelete(id);
		if (!preset) {
			return res.status(404).json({ message: "Preset not found" });
		}

		logger.info(`Preset deleted successfully [${id}]`);
		return res.status(200).json({ message: "Preset deleted successfully" });
	} catch (error) {
		logger.error("Failed to delete preset:", error);
		return res.status(500).json({ message: "Internal server error deleting preset" });
	}
};
