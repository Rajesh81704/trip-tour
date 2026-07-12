import {
	createInquiryFormRequest,
	deleteInquiryFormRequest,
	getInquiryFormRequests,
} from "@/controllers/inquiryForm.controller";
import express from "express";

const inquiryFormRouter = express.Router();

/**
 * @swagger
 * /inquiries:
 *   post:
 *     summary: Submit an inquiry form
 *     tags: [Inquiries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInquiryRequest'
 *     responses:
 *       201:
 *         description: Inquiry submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inquiry'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
inquiryFormRouter.post("/", createInquiryFormRequest);

/**
 * @swagger
 * /inquiries:
 *   get:
 *     summary: Get all inquiry form submissions
 *     tags: [Inquiries]
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: List of inquiries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inquiry'
 */
inquiryFormRouter.get("/", getInquiryFormRequests);

/**
 * @swagger
 * /inquiries/{id}:
 *   delete:
 *     summary: Delete an inquiry by ID
 *     tags: [Inquiries]
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inquiry ObjectId
 *     responses:
 *       200:
 *         description: Inquiry deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: Inquiry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
inquiryFormRouter.delete("/:id", deleteInquiryFormRequest);

export default inquiryFormRouter;
