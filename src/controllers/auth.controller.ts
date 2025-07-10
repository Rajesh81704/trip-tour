import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "@/config/config";
import { IUser } from "@/models/user.model";

export const googleAuth = (req: Request, res: Response) => {
	const user = req.user as IUser;
	if (!user) {
		return res.redirect("/login");
	}

	const payload = {
		id: user._id,
		email: user.email,
		name: user.name,
		avatar: user.avatar,
	};

	const token = jwt.sign(payload, config.jwtSecret as string, {
		expiresIn: "7d",
	});

	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	res.redirect("/");
};
