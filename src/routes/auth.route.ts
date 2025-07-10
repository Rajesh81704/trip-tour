import express from "express";
import passport from "passport";
import { googleAuth } from "@/controllers/auth.controller";
const authRouter = express.Router();

authRouter.get(
	"/google",
	passport.authenticate("google", { session: false, scope: ["profile", "email"] }),
);

authRouter.get(
	"/callback/google",
	passport.authenticate("google", {
		failureRedirect: "/login",
		session: false,
		scope: ["profile", "email"],
	}),
	googleAuth,
);

export default authRouter;
