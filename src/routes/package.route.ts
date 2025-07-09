import {
	createPackage,
	deletePackage,
	getAllPackages,
	getPackageById,
	getPackageByState,
	gettingPopularPackages,
	updatePackage,
} from "@/controllers/package.controller";
import express from "express";

const packageRouter = express.Router();

/**
 * @route   POST / /api/packages
 * @desc    Create a new package
 * @access  admin
 */
packageRouter.post("/", createPackage);
/**
 * @route   GET / /api/packages
 * @desc    Get all packages
 * @access  Public
 */

packageRouter.get("/", getAllPackages);
/**
 * @route   GET /:id /api/packages/:id
 * @desc    Get a package by ID
 * @access  Public
 */
packageRouter.get("/:id", getPackageById);
/**
 * @route   GET /state/Rajasthan /api/packages/state/:state
 * @desc    Get packages by state
 * @access  Public
 */
packageRouter.get("/state/:state", getPackageByState);
/**
 * @route   PUT /:id /api/packages/:id
 * @desc    Update a package by ID
 * @access  admin
 */
packageRouter.put("/:id", updatePackage);
/**
 * @route   DELETE /:id /api/packages/:id
 * @desc    Delete a package by ID
 * @access  admin
 */

packageRouter.delete("/:id", deletePackage);

packageRouter.get("/popular", gettingPopularPackages);

export default packageRouter;
