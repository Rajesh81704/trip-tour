import express, { RequestHandler } from "express";
import {
	createPreset,
	getPresets,
	getPresetDestinations,
	getPresetById,
	updatePreset,
	deletePreset,
} from "@/controllers/preset.controller";
import { adminVerify } from "@/middlewares/adminverify.middleware";

const presetRouter = express.Router();

presetRouter.get("/", getPresets as RequestHandler);
presetRouter.get("/destinations", getPresetDestinations as RequestHandler);
presetRouter.get("/:id", getPresetById as RequestHandler);

// Admin Protected Routes
presetRouter.post("/", adminVerify, createPreset as RequestHandler);
presetRouter.put("/:id", adminVerify, updatePreset as RequestHandler);
presetRouter.delete("/:id", adminVerify, deletePreset as RequestHandler);

export default presetRouter;
