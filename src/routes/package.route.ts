import {
	createPackage,
	deletePackage,
	getAllPackages,
	getPackageById,
	gettingPopularPackages,
	updatePackage,
} from "@/controllers/package.controller";
import express from "express";
import { upload } from "@/middlewares/multer.middleware";

const packageRouter = express.Router();

/**
 * @route   POST / /api/packages
 * @desc    Create a new package
 * @access  admin
 */
packageRouter.post("/", upload.array("images", 10), createPackage);
/**
 * @route   GET / /api/packages
 * @desc    Get all packages
 * @access  Public
 */

packageRouter.get("/", getAllPackages);

/**
 * @route   GET /popular /api/packages/popular
 * @desc    Get popular packages
 * @access  Public
 */
packageRouter.get("/popular", gettingPopularPackages);

/**
 * @route   GET /:id /api/packages/:id
 * @desc    Get a package by ID
 * @access  Public
 */
packageRouter.get("/:id", getPackageById);
/**
 * @route   PUT /:id /api/packages/:id
 * @desc    Update a package by ID
 * @access  admin
 */
packageRouter.put("/:id", upload.array("images", 10), updatePackage);
/**
 * @route   DELETE /:id /api/packages/:id
 * @desc    Delete a package by ID
 * @access  admin
 */

packageRouter.delete("/:id", deletePackage);

export default packageRouter;
