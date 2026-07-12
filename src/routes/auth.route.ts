import express from "express";
import passport from "passport";
import { google, register, login, adminLogin, adminLogout } from "@/controllers/auth.controller";
const authRouter = express.Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Auth]
 *     description: Redirects the user to Google's OAuth consent screen.
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
authRouter.get(
	"/google",
	passport.authenticate("google", { session: false, scope: ["profile", "email"] }),
);

/**
 * @swagger
 * /auth/callback/google:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     description: Callback URL that Google redirects to after authentication. Sets a JWT cookie and redirects to the frontend.
 *     responses:
 *       302:
 *         description: Redirect to frontend on success
 *       401:
 *         description: Authentication failed
 */
authRouter.get(
	"/callback/google",
	passport.authenticate("google", {
		failureRedirect: "/login",
		session: false,
		scope: ["profile", "email"],
	}),
	google,
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login as a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Logged in successfully — sets a JWT cookie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post("/login", login);

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLoginRequest'
 *     responses:
 *       200:
 *         description: Admin logged in — sets an admin JWT cookie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post("/admin/login", adminLogin);

/**
 * @swagger
 * /auth/admin/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Auth]
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Admin logged out — clears the admin cookie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
authRouter.post("/admin/logout", adminLogout);

export default authRouter;
