import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "@/config/config";
import { IAdmin } from "@/models/admin.model";

export const adminVerify = (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.adminToken;
	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	try {
		const decoded = jwt.verify(token, config.jwtSecret as string);
		req.user = decoded as IAdmin;
		next();
	} catch (error) {
		console.error(error);
		return res.status(401).json({ message: "Unauthorized" });
	}
};
