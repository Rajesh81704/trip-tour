import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "@/config/config";
import { logger } from "@/utils/logger";

export const userVerify = (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.token;

	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	try {
		const decoded = jwt.verify(token, config.jwtSecret as string);
		req.user = decoded;
		next();
	} catch (error) {
		logger.error(error);
		return res.status(401).json({ message: "Unauthorized" });
	}
};
