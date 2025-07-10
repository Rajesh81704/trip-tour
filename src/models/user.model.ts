import mongoose, { Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
	name: string;
	username: string;
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
		username: {
			type: String,
			required: false,
			unique: true,
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

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}

	this.password = await bcrypt.hash(this.password, 10);
	next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
	return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export { UserModel };
