import type { Request, Response } from "express";
import { ErrorHandler } from "@/middlewares/error-handler.middleware";
import { IUser, UserModel } from "@/models/user.model";

async function getUser(req: Request, res: Response) {
	try {
		const reqUser = req.user as IUser;
		if (!reqUser.id) {
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
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Internal server error");
	}
}

export { getUser };
