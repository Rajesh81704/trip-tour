import {
	getB2B,
	CreateB2BRequest,
	getB2BById,
	deleteB2BRequest,
} from "@/controllers/b2b.controller";
import express from "express";

const b2bRouter = express.Router();

/**
 * @swagger
 * /b2b-requests:
 *   post:
 *     summary: Submit a B2B partnership request
 *     tags: [B2B]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateB2BRequest'
 *     responses:
 *       201:
 *         description: B2B request submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/B2BRequest'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
b2bRouter.post("/", CreateB2BRequest);

/**
 * @swagger
 * /b2b-requests:
 *   get:
 *     summary: Get all B2B requests
 *     tags: [B2B]
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: List of B2B requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/B2BRequest'
 */
b2bRouter.get("/", getB2B);

/**
 * @swagger
 * /b2b-requests/{id}:
 *   get:
 *     summary: Get a B2B request by ID
 *     tags: [B2B]
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: B2B request ObjectId
 *     responses:
 *       200:
 *         description: B2B request details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/B2BRequest'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
b2bRouter.get("/:id", getB2BById);

/**
 * @swagger
 * /b2b-requests/{id}:
 *   delete:
 *     summary: Delete a B2B request by ID
 *     tags: [B2B]
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
 *         description: B2B request deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
b2bRouter.delete("/:id", deleteB2BRequest);

export default b2bRouter;
