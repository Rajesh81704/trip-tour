import express from "express";
import { getPresignedUrl, getBatchPresignedUrls, deleteUpload, uploadDirect, uploadMulter, serveR2File } from "@/controllers/upload.controller";

const uploadRouter = express.Router();

/**
 * @swagger
 * /upload/file/*:
 *   get:
 *     summary: Serve an R2 file directly from backend storage
 *     tags: [Upload]
 */
uploadRouter.get("/file/*", serveR2File);
uploadRouter.get("/file", serveR2File);

/**
 * @swagger
 * /upload/presign:
 *   post:
 *     summary: Get a presigned PUT URL for direct browser-to-R2 upload
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contentType]
 *             properties:
 *               contentType:
 *                 type: string
 *                 example: image/jpeg
 *               folder:
 *                 type: string
 *                 enum: [packages, hotels, flights, sightseeings, destinations, misc]
 *                 default: packages
 *     responses:
 *       200:
 *         description: Presigned URL + public URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 uploadUrl: { type: string }
 *                 key: { type: string }
 *                 publicUrl: { type: string }
 */
uploadRouter.post("/presign", getPresignedUrl);

/**
 * @swagger
 * /upload/presign/batch:
 *   post:
 *     summary: Get presigned PUT URLs for multiple files at once
 *     tags: [Upload]
 */
uploadRouter.post("/presign/batch", getBatchPresignedUrls);

/**
 * @swagger
 * /upload:
 *   delete:
 *     summary: Delete a file from R2 storage by key
 *     tags: [Upload]
 */
uploadRouter.delete("/", deleteUpload);

/**
 * @swagger
 * /upload/direct:
 *   post:
 *     summary: Upload files to R2 through the backend (no CORS needed)
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items: { type: string, format: binary }
 *               folder:
 *                 type: string
 *                 enum: [packages, hotels, flights, sightseeings, destinations, misc]
 *                 default: packages
 *     responses:
 *       200:
 *         description: Files uploaded
 */
uploadRouter.post("/direct", uploadMulter.array("files", 20), uploadDirect);

export default uploadRouter;
