import mongoose, { Document } from "mongoose";

interface IContact extends Document {
	name: string;
	email: string;
	subject: string;
	message: string;
}

const contactSchema = new mongoose.Schema<IContact>(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		subject: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

const ContactModel = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
export { ContactModel, IContact };
