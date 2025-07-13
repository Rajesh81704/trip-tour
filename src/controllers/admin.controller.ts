import type { Request, Response } from "express";
import { ErrorHandler } from "@/middlewares/error-handler.middleware";
import { IAdmin, AdminModel } from "@/models/admin.model";

async function getAdmin(req: Request, res: Response) {
	try {
		const reqAdmin = req.user as IAdmin;
		const admin = await AdminModel.findById(reqAdmin.id).select("-password -__v");
		if (!admin) {
			return res.status(404).json({ message: "Admin not found" });
		}
		const { _id, email, name } = admin;
		return res.status(200).json({
			admin: {
				id: _id,
				email,
				name,
			},
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new ErrorHandler(400, error.message);
		}
		throw new ErrorHandler(500, "Internal server error");
	}
}

export { getAdmin };
