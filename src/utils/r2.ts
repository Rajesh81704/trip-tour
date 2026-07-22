import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";
import { logger } from "@/utils/logger";

// ─── R2 client (S3-compatible) ────────────────────────────────────────────────
const r2Client = new S3Client({
	region: "auto",
	endpoint: process.env.R2_ENDPOINT_URL,
	credentials: {
		accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
	},
	// R2 requires path-style addressing
	forcePathStyle: false,
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_BASE = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

// ─── Generate a presigned PUT URL (browser uploads directly to R2) ────────────
export async function generatePresignedUploadUrl(
	contentType: string,
	folder = "packages",
	expiresIn = 300, // 5 minutes
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
	const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
	const key = `${folder}/${uuid()}.${ext}`;

	const command = new PutObjectCommand({
		Bucket:      BUCKET,
		Key:         key,
		ContentType: contentType,
	});

	const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn });
	const publicUrl = `${PUBLIC_BASE}/${key}`;

	return { uploadUrl, key, publicUrl };
}

// ─── Upload a file to R2 from the server (no CORS needed) ────────────────────
export async function uploadToR2(
	buffer: Buffer,
	contentType: string,
	folder = "packages",
): Promise<{ key: string; publicUrl: string }> {
	const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
	const key = `${folder}/${uuid()}.${ext}`;

	await r2Client.send(
		new PutObjectCommand({
			Bucket:      BUCKET,
			Key:         key,
			ContentType: contentType,
			Body:        buffer,
		}),
	);

	const publicUrl = `${PUBLIC_BASE}/${key}`;
	return { key, publicUrl };
}

// ─── Delete an object from R2 ─────────────────────────────────────────────────
export async function deleteFromR2(key: string): Promise<boolean> {
	if (!key) return false;
	try {
		await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
		return true;
	} catch (err) {
		logger.error("R2 delete error:", err);
		return false;
	}
}

// ─── Generate a presigned GET URL (for private buckets — optional) ────────────
export async function generatePresignedGetUrl(key: string, expiresIn = 3600): Promise<string> {
	const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
	return getSignedUrl(r2Client, command, { expiresIn });
}
