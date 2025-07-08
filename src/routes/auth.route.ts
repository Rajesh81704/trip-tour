import express from "express";
import passport from "passport";

const authRouter = express.Router();

authRouter.get("/google", passport.authenticate("google", { scope: ["profile"] }));

authRouter.get(
	"/callback/google",
	passport.authenticate("google", { failureRedirect: "/login" }),
	function (req: express.Request, res: express.Response) {
		console.log("Google authentication successful:", req, res);

		res.redirect("/");
	},
);

authRouter.get("/facebook", passport.authenticate("facebook"));

authRouter.get(
	"/callback/facebook",
	passport.authenticate("facebook", { failureRedirect: "/login" }),
	function (req: express.Request, res: express.Response) {
		console.log("Facebook authentication successful:", req, res);

		res.redirect("/");
	},
);
export default authRouter;
