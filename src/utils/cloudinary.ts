import { cloudinary } from "@/config/cloudinary";
import { v4 as uuid } from "uuid";
import sharp from "sharp";
import streamifier from "streamifier";
import { logger } from "@/utils/logger";

interface ReturnTypes {
	public_id: string | null;
	url: string | null;
}

interface CloudinaryUploadResult {
	public_id: string;
	secure_url: string;
}

const uploadToCloudinary = async (file: Express.Multer.File): Promise<ReturnTypes> => {
	if (!file || !file.buffer) {
		return {
			public_id: null,
			url: null,
		};
	}

	try {
		const compressedBuffer = await sharp(file.buffer)
			.resize({ width: 200 })
			.png({ quality: 70 })
			.toBuffer();

		const uploadFromBuffer = (buffer: Buffer): Promise<CloudinaryUploadResult> => {
			return new Promise((resolve, reject) => {
				const uploadImage = cloudinary.uploader.upload_stream(
					{
						resource_type: "image",
						public_id: uuid(),
					},
					(error, result) => {
						if (error) return reject(error);

						if (result) resolve(result as CloudinaryUploadResult);
						else reject(new Error("Upload result is undefined"));
					},
				);

				streamifier.createReadStream(buffer).pipe(uploadImage);
			});
		};

		const result = await uploadFromBuffer(compressedBuffer);

		return {
			public_id: result.public_id,
			url: result.secure_url,
		};
	} catch (error) {
		logger.error("Image Upload error: ", error);
		return {
			public_id: null,
			url: null,
		};
	}
};

const deleteFromCloudinary = async (public_id: string): Promise<boolean> => {
	if (!public_id) {
		return false;
	}

	const deletePromise = new Promise<boolean>((resolve, reject) => {
		cloudinary.uploader.destroy(public_id, { resource_type: "image" }, (error, result) => {
			if (error) return reject(error);

			if (result.result === "ok") return resolve(true);
			else return resolve(false);
		});
	});

	try {
		const success = await deletePromise;
		return success;
	} catch (error) {
		logger.error("Error deleting from Cloudinary:", error);
		return false;
	}
};

export { uploadToCloudinary, deleteFromCloudinary };
