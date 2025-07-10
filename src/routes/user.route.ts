import express, { RequestHandler } from "express";
import { getUser } from "@/controllers/user.controller";
import { userVerify } from "@/middlewares/userverify.middleware";

const userRouter = express.Router();

userRouter.get("/me", userVerify, getUser as RequestHandler);

export default userRouter;
