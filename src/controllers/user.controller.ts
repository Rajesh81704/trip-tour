import type { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "@/middlewares/error-handler.middleware";
import { IUser, UserModel } from "@/models/user.model";

async function getUser(req: Request, res: Response, next: NextFunction) {
	try {
		const reqUser = req.user as IUser;
		if (!reqUser || !reqUser.id) {
			return res.status(401).json({ message: "Unauthorized: No user ID found" });
		}
		const user = await UserModel.findById(reqUser.id).select("-password -__v");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		const { _id, email, name, avatar, phone } = user;
		return res.status(200).json({
			user: {
				id: _id,
				email,
				name,
				avatar,
				phone: phone || "",
			},
		});
	} catch (error) {
		if (error instanceof Error) {
			return next(new ErrorHandler(400, error.message));
		}
		return next(new ErrorHandler(500, "Internal server error"));
	}
}

export { getUser };
