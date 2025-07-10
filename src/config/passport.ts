/* eslint-disable @typescript-eslint/no-explicit-any */

import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { config } from "@/config/config";
import { UserModel } from "@/models/user.model";
import passport from "passport";

passport.use(
	new GoogleStrategy(
		{
			clientID: config.googleClientId as string,
			clientSecret: config.googleClientSecret as string,
			callbackURL:
				process.env.NODE_ENV === "production"
					? "https://api.xyz.id/auth/callback/google"
					: "http://localhost:8000/auth/callback/google",
		},
		async function (accessToken: string, refreshToken: string, profile: Profile, cb) {
			try {
				const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : undefined;
				const name = profile.displayName;
				const avatar =
					profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined;
				const googleId = profile.id;

				if (!email) {
					const error = new Error("No email found in Google profile");
					(error as any).status = 400;
					return cb(error);
				}

				let user;
				try {
					user = await UserModel.findOne({ googleId });
				} catch (dbErr) {
					const error = new Error("Database error while searching by Google ID");
					(error as any).details = dbErr;
					(error as any).status = 500;
					return cb(error);
				}

				if (!user) {
					try {
						user = await UserModel.findOne({ email });
					} catch (dbErr) {
						const error = new Error("Database error while searching by email");
						(error as any).details = dbErr;
						(error as any).status = 500;
						return cb(error);
					}
				}

				if (!user) {
					try {
						user = await UserModel.create({
							name,
							email,
							avatar,
							googleId,
							googleAccessToken: accessToken,
							googleRefreshToken: refreshToken,
						});
					} catch (createErr) {
						const error = new Error("Error creating new user");
						(error as any).details = createErr;
						(error as any).status = 500;
						return cb(error);
					}
				} else {
					let updated = false;
					if (user.name !== name) {
						user.name = name;
						updated = true;
					}
					if (user.avatar !== avatar) {
						user.avatar = avatar;
						updated = true;
					}
					if (user.googleAccessToken !== accessToken) {
						user.googleAccessToken = accessToken;
						updated = true;
					}
					if (user.googleRefreshToken !== refreshToken) {
						user.googleRefreshToken = refreshToken;
						updated = true;
					}
					if (!user.googleId) {
						user.googleId = googleId;
						updated = true;
					}
					if (updated) {
						try {
							await user.save();
						} catch (saveErr) {
							const error = new Error("Error updating user");
							(error as any).details = saveErr;
							(error as any).status = 500;
							return cb(error);
						}
					}
				}

				return cb(null, user);
			} catch (err) {
				const error = new Error("Unexpected error during Google authentication");
				(error as any).details = err;
				(error as any).status = 500;
				return cb(error);
			}
		},
	),
);

export default passport;
