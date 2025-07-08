import { Strategy as Google } from "passport-google-oauth20";
import { config } from "./config";
import { Strategy as Facebook } from "passport-facebook";

import passport from "passport";

passport.use(
	new Google(
		{
			clientID: config.googleClientId!,
			clientSecret: config.googleClientSecret!,
			callbackURL: "http://localhost:8000/auth/callback/google",
		},
		function (accessToken: string, refreshToken: string, profile: object, cb) {
			console.log(accessToken, refreshToken, JSON.stringify(profile, null, 2));
			return cb(null, profile);
		},
	),
);

passport.use(
	new Facebook(
		{
			clientID: config.facebookAppId!,
			clientSecret: config.facebookAppSecret!,
			callbackURL: "http://localhost:8000/auth/facebook/callback",
			profileFields: ["id", "emails", "name", "picture.type(large)"], // Requesting required user data
		},
		function (accessToken: string, refreshToken: string, profile: object, cb) {
			console.log(accessToken, refreshToken, JSON.stringify(profile, null, 2));
			return cb(null, profile);
		},
	),
);
export default passport;
