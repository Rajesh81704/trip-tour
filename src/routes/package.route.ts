import {
	createPackage,
	deletePackage,
	getAllPackages,
	getFilterMeta,
	getPackageById,
	gettingPopularPackages,
	updatePackage,
} from "@/controllers/package.controller";
import express from "express";
import { upload } from "@/middlewares/multer.middleware";

const packageRouter = express.Router();

/**
 * @swagger
 * /packages:
 *   get:
 *     summary: Get all packages with filtering, sorting and pagination
 *     tags: [Packages]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Full-text search across title, description, location, category, features, etc.
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Filter by category (case-insensitive, partial match)
 *       - in: query
 *         name: state
 *         schema: { type: string }
 *         description: Filter by location state
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *         description: Filter by location city
 *       - in: query
 *         name: destination
 *         schema: { type: string }
 *         description: Filter by destination
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *         description: Minimum price (inclusive)
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *         description: Maximum price (inclusive)
 *       - in: query
 *         name: minDays
 *         schema: { type: integer }
 *         description: Minimum trip duration in days
 *       - in: query
 *         name: maxDays
 *         schema: { type: integer }
 *         description: Maximum trip duration in days
 *       - in: query
 *         name: onSale
 *         schema: { type: boolean }
 *         description: If true, return only packages with discount > 0
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, oldest, price-asc, price-desc, popular, discount]
 *         description: Sort order (default newest)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *         description: Results per page (max 100)
 *     responses:
 *       200:
 *         description: Paginated list of packages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 packages:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Package' }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     pages: { type: integer }
 *                     hasNext: { type: boolean }
 *                     hasPrev: { type: boolean }
 */
packageRouter.get("/", getAllPackages);

/**
 * @swagger
 * /packages/filters/meta:
 *   get:
 *     summary: Get distinct filter values for populating sidebar UI
 *     tags: [Packages]
 *     description: Returns all distinct categories, states, and the min/max price & duration range.
 *     responses:
 *       200:
 *         description: Filter metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 filters:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items: { type: string }
 *                     states:
 *                       type: array
 *                       items: { type: string }
 *                     priceRange:
 *                       type: object
 *                       properties:
 *                         min: { type: number }
 *                         max: { type: number }
 *                         minDays: { type: integer }
 *                         maxDays: { type: integer }
 */
packageRouter.get("/filters/meta", getFilterMeta);

/**
 * @swagger
 * /packages/popular:
 *   get:
 *     summary: Get popular packages sorted by view count
 *     tags: [Packages]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 6 }
 *         description: Number of packages to return (max 20)
 *     responses:
 *       200:
 *         description: List of popular packages
 */
packageRouter.get("/popular", gettingPopularPackages);

/**
 * @swagger
 * /packages/{id}:
 *   get:
 *     summary: Get a package by ID (also increments view count)
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Package details with reviews
 *       404:
 *         description: Package not found
 */
packageRouter.get("/:id", getPackageById);

/**
 * @swagger
 * /packages:
 *   post:
 *     summary: Create a new travel package
 *     tags: [Packages]
 *     security:
 *       - adminCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, price, discount, category]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               discount: { type: number }
 *               category: { type: string }
 *               location[city]: { type: string }
 *               location[state]: { type: string }
 *               location[destination]: { type: string }
 *               duration[day]: { type: integer }
 *               duration[night]: { type: integer }
 *               features: { type: array, items: { type: string } }
 *               highlights: { type: array, items: { type: string } }
 *               inclusions: { type: array, items: { type: string } }
 *               exclusions: { type: array, items: { type: string } }
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Package created
 */
packageRouter.post("/", upload.array("images", 10), createPackage);

/**
 * @swagger
 * /packages/{id}:
 *   put:
 *     summary: Update a package by ID
 *     tags: [Packages]
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Package updated
 *       404:
 *         description: Package not found
 */
packageRouter.put("/:id", upload.array("images", 10), updatePackage);

/**
 * @swagger
 * /packages/{id}:
 *   delete:
 *     summary: Delete a package by ID
 *     tags: [Packages]
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Package deleted
 *       404:
 *         description: Package not found
 */
packageRouter.delete("/:id", deletePackage);

export default packageRouter;
