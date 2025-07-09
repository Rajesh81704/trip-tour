import {
	getB2B,
	CreateB2BRequest,
	getB2BById,
	deleteB2BRequest,
} from "@/controllers/b2b.controller";
import express from "express";

const b2bRouter = express.Router();

b2bRouter.post("/", CreateB2BRequest);

b2bRouter.get("/", getB2B);

b2bRouter.get("/:id", getB2BById);

b2bRouter.delete("/:id", deleteB2BRequest);

export default b2bRouter;
