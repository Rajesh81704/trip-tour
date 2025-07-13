import express, { RequestHandler } from "express";
import { getAdmin } from "@/controllers/admin.controller";
import { adminVerify } from "@/middlewares/adminverify.middleware";

const adminRouter = express.Router();

adminRouter.get("/me", adminVerify, getAdmin as RequestHandler);

export default adminRouter;
