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

export const userOrAdminVerify = (req: Request, res: Response, next: NextFunction) => {
	const userToken = req.cookies.token;
	const adminToken = req.cookies.adminToken;

	if (!userToken && !adminToken) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	if (adminToken) {
		try {
			const decoded = jwt.verify(adminToken, config.jwtSecret as string);
			(req as any).admin = decoded;
			(req as any).user = decoded;
			return next();
		} catch (err) {
			// fallback to userToken check
		}
	}

	if (userToken) {
		try {
			const decoded = jwt.verify(userToken, config.jwtSecret as string);
			req.user = decoded;
			return next();
		} catch (error) {
			logger.error(error);
			return res.status(401).json({ message: "Unauthorized" });
		}
	}

	return res.status(401).json({ message: "Unauthorized" });
};
