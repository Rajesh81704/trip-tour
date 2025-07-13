import mongoose, { Document } from "mongoose";

export interface IAdmin extends Document {
	email: string;
	password: string;
	username: string;
	name: string;
}

const adminSchema = new mongoose.Schema<IAdmin>({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	username: { type: String, required: true },
	name: { type: String, required: true },
});

export const AdminModel = mongoose.model<IAdmin>("Admin", adminSchema);
