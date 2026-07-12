import express, { RequestHandler } from "express";
import { getAdmin } from "@/controllers/admin.controller";
import { adminVerify } from "@/middlewares/adminverify.middleware";

const adminRouter = express.Router();

/**
 * @swagger
 * /admin/me:
 *   get:
 *     summary: Get the authenticated admin's profile
 *     tags: [Admin]
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Admin profile returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
adminRouter.get("/me", adminVerify, getAdmin as RequestHandler);

export default adminRouter;
