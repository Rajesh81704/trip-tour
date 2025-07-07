import express from "express";
import { getUser } from "@/controllers/user";

const router = express.Router();

router.get("/get-user", getUser);

export { router as userRouter };
