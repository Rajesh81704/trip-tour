import { Request, Response } from "express";
import { generatePresignedUploadUrl, deleteFromR2, uploadToR2, getObjectFromR2 } from "@/utils/r2";
import { ErrorHandler } from "@/middlewares/error-handler.middleware";
import { logger } from "@/utils/logger";
import multer from "multer";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const VALID_FOLDERS = ["packages", "hotels", "flights", "sightseeings", "destinations", "misc"];

// Multer configured for memory storage (buffer)
export const uploadMulter = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
	fileFilter: (_req, file, cb) => {
		if (ALLOWED_TYPES.includes(file.mimetype.toLowerCase())) cb(null, true);
		else cb(new Error(`Unsupported file type: ${file.mimetype}`));
	},
});

/**
 * POST /upload/presign
 * Body: { contentType: string, folder?: string }
 * Returns: { uploadUrl, key, publicUrl }
 *
 * The browser then PUTs the file directly to `uploadUrl`.
 * After upload, use `publicUrl` as the stored URL and `key` as the public_id.
 */
export const getPresignedUrl = async (req: Request, res: Response): Promise<void> => {
	const { contentType, folder = "packages" } = req.body as {
		contentType: string;
		folder?: string;
	};

	if (!contentType) throw new ErrorHandler(400, "contentType is required");
	if (!ALLOWED_TYPES.includes(contentType.toLowerCase()))
		throw new ErrorHandler(400, `Unsupported file type: ${contentType}. Allowed: ${ALLOWED_TYPES.join(", ")}`);
	if (!VALID_FOLDERS.includes(folder))
		throw new ErrorHandler(400, `Invalid folder. Allowed: ${VALID_FOLDERS.join(", ")}`);

	const result = await generatePresignedUploadUrl(contentType, folder);
	res.status(200).json({ success: true, ...result });
};

/**
 * POST /upload/presign/batch
 * Body: { files: Array<{ contentType: string, folder?: string }> }
 * Returns: { results: Array<{ uploadUrl, key, publicUrl }> }
 *
 * For uploading multiple files in one round-trip.
 */
export const getBatchPresignedUrls = async (req: Request, res: Response): Promise<void> => {
	const { files } = req.body as {
		files: { contentType: string; folder?: string }[];
	};

	if (!Array.isArray(files) || files.length === 0)
		throw new ErrorHandler(400, "files array is required");
	if (files.length > 20)
		throw new ErrorHandler(400, "Maximum 20 files per batch request");

	const results = await Promise.all(
		files.map(({ contentType, folder = "packages" }) => {
			if (!ALLOWED_TYPES.includes((contentType ?? "").toLowerCase()))
				throw new ErrorHandler(400, `Unsupported file type: ${contentType}`);
			return generatePresignedUploadUrl(contentType, folder);
		}),
	);

	res.status(200).json({ success: true, results });
};

/**
 * DELETE /upload
 * Body: { key: string }
 * Deletes a file from R2 by its key (public_id).
 */
export const deleteUpload = async (req: Request, res: Response): Promise<void> => {
	const { key } = req.body as { key: string };
	if (!key) throw new ErrorHandler(400, "key is required");

	const success = await deleteFromR2(key);
	if (!success) throw new ErrorHandler(500, "Failed to delete file from storage");

	res.status(200).json({ success: true, message: "File deleted successfully" });
};

/**
 * POST /upload/direct
 * Multipart form: files[] + folder (string)
 * Uploads files to R2 server-side (no CORS needed on R2 bucket).
 * Returns: { success: true, results: Array<{ key, publicUrl }> }
 */
export const uploadDirect = async (req: Request, res: Response): Promise<void> => {
	const files = req.files as Express.Multer.File[] | undefined;
	const folder = (req.body.folder as string) || "packages";

	if (!files || files.length === 0)
		throw new ErrorHandler(400, "No files provided");
	if (!VALID_FOLDERS.includes(folder))
		throw new ErrorHandler(400, `Invalid folder. Allowed: ${VALID_FOLDERS.join(", ")}`);

	const results = await Promise.all(
		files.map((f) => uploadToR2(f.buffer, f.mimetype, folder)),
	);

	res.status(200).json({ success: true, results });
};

/**
 * GET /upload/file/*
 * Serves an R2 file stream directly with proper Content-Type & cache headers.
 */
export const serveR2File = async (req: Request, res: Response): Promise<void> => {
	const key = (req.params as any)[0] || (req.query.key as string);
	if (!key) throw new ErrorHandler(400, "File key is required");

	try {
		const obj = await getObjectFromR2(key);
		if (!obj.Body) throw new ErrorHandler(404, "File not found in storage");

		if (obj.ContentType) res.setHeader("Content-Type", obj.ContentType);
		if (obj.ContentLength) res.setHeader("Content-Length", obj.ContentLength);
		res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

		const stream = obj.Body as any;
		if (typeof stream.pipe === "function") {
			stream.pipe(res);
		} else {
			const byteArray = await stream.transformToByteArray();
			res.send(Buffer.from(byteArray));
		}
	} catch (err) {
		logger.error(`Failed to serve R2 file ${key}:`, err);
		throw new ErrorHandler(404, "File not found");
	}
};
