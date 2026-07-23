import express, { RequestHandler } from "express";
import {
  createVisaInquiry,
  getMyVisaInquiries,
  getAllVisaInquiries,
  updateVisaInquiryStatus,
  deleteVisaInquiry,
  getPublicVisaPackages,
  getAllVisaPackages,
  createVisaPackage,
  updateVisaPackage,
  deleteVisaPackage,
} from "@/controllers/visa.controller";
import { userVerify } from "@/middlewares/userverify.middleware";

const visaRouter = express.Router();

// Visa Packages routes
visaRouter.get("/packages", getPublicVisaPackages);
visaRouter.get("/packages/all", getAllVisaPackages);
visaRouter.post("/packages", createVisaPackage);
visaRouter.put("/packages/:id", updateVisaPackage);
visaRouter.delete("/packages/:id", deleteVisaPackage);

// Visa Inquiries routes
visaRouter.get("/my-requests", userVerify, getMyVisaInquiries as RequestHandler);
visaRouter.post("/inquire", createVisaInquiry);
visaRouter.get("/inquiries", getAllVisaInquiries);
visaRouter.patch("/inquiries/:id/status", updateVisaInquiryStatus);
visaRouter.delete("/inquiries/:id", deleteVisaInquiry);

export default visaRouter;
