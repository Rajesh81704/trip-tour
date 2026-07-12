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
 *             required:
 *               - title
 *               - description
 *               - price
 *               - discount
 *               - category
 *               - location[city]
 *               - location[state]
 *               - location[destination]
 *               - duration[day]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Kerala Backwaters Tour"
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 15000
 *               discount:
 *                 type: number
 *                 example: 10
 *               category:
 *                 type: string
 *                 example: "Nature"
 *               location[city]:
 *                 type: string
 *                 example: "Alleppey"
 *               location[state]:
 *                 type: string
 *                 example: "Kerala"
 *               location[destination]:
 *                 type: string
 *                 example: "Alleppey Backwaters"
 *               duration[day]:
 *                 type: integer
 *                 example: 5
 *               duration[night]:
 *                 type: integer
 *                 example: 4
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               highlights:
 *                 type: array
 *                 items:
 *                   type: string
 *               inclusions:
 *                 type: array
 *                 items:
 *                   type: string
 *               exclusions:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Up to 10 images
 *     responses:
 *       201:
 *         description: Package created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Package'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
packageRouter.post("/", upload.array("images", 10), createPackage);

/**
 * @swagger
 * /packages:
 *   get:
 *     summary: Get all packages
 *     tags: [Packages]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or destination
 *     responses:
 *       200:
 *         description: List of packages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Package'
 */
packageRouter.get("/", getAllPackages);

/**
 * @swagger
 * /packages/popular:
 *   get:
 *     summary: Get popular packages (sorted by view count)
 *     tags: [Packages]
 *     responses:
 *       200:
 *         description: List of popular packages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Package'
 */
packageRouter.get("/popular", gettingPopularPackages);

/**
 * @swagger
 * /packages/{id}:
 *   get:
 *     summary: Get a package by ID
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ObjectId
 *     responses:
 *       200:
 *         description: Package details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Package'
 *       404:
 *         description: Package not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
packageRouter.get("/:id", getPackageById);

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
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *               category:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Up to 10 images
 *     responses:
 *       200:
 *         description: Package updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Package'
 *       404:
 *         description: Package not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: Package not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
packageRouter.delete("/:id", deletePackage);

export default packageRouter;
