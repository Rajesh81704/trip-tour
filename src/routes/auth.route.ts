import express from "express";
import passport from "passport";
import { google, register, login, adminLogin, adminLogout } from "@/controllers/auth.controller";
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
	google,
);

authRouter.post("/register", register);
authRouter.post("/login", login);

authRouter.post("/admin/login", adminLogin);
authRouter.post("/admin/logout", adminLogout);

export default authRouter;
