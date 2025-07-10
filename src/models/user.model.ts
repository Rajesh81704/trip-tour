import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
	name: string;
	password: string;
	email: string;
	avatar: string;
	googleId: string;
	googleAccessToken: string;
	googleRefreshToken: string;
}

const userSchema = new mongoose.Schema<IUser>(
	{
		name: {
			type: String,
			required: false,
		},
		email: {
			type: String,
			required: false,
			unique: true,
		},
		googleId: {
			type: String,
			required: false,
		},
		googleAccessToken: {
			type: String,
			required: false,
		},
		googleRefreshToken: {
			type: String,
			required: false,
		},
		avatar: {
			type: String,
			required: false,
		},
		password: {
			type: String,
			required: false,
			select: false,
		},
	},
	{ timestamps: true },
);

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export { UserModel };
