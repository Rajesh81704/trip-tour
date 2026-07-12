import express, { RequestHandler } from "express";
import { getUser } from "@/controllers/user.controller";
import { userVerify } from "@/middlewares/userverify.middleware";

const userRouter = express.Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get("/me", userVerify, getUser as RequestHandler);

export default userRouter;
