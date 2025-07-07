import type { Request, Response } from "express";
import { ErrorHandler } from "@/middlewares/error-handler";

async function getUser(_req: Request, res: Response) {
	const user = {
		id: 1,
		name: "user",
		email: "user@gmail.com",
	};

	if (!user) throw new ErrorHandler(404, "User not found !");
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return res.status(200).json(user);
}

export { getUser };
