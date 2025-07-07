import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "@/config/db";
import { v2 as cloudinary } from "cloudinary";
import { userRouter } from "@/routes/user";
import { errorHandler } from "@/middlewares/error-handler";
import { config } from "@/config/config";

const app = express();

connectDB();

app.use(
	cors({
		origin: [`${config.frontendUrlDev}`, `${config.frontendUrlProd}`],
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	}),
);

cloudinary.config({
	cloud_name: config.cloudinaryName,
	api_key: config.cloudinaryApiKey,
	api_secret: config.cloudinarySecret,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
	res.status(200).send("This app was created using npx create-types-backend@latest !");
});

app.use("/user", userRouter);

app.use(errorHandler);

const PORT = Number(config.port) || 8000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
