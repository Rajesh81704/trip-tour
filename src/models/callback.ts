import mongoose, { Document } from "mongoose";

interface ICallback extends Document {
	name: string;
	email: string;
	phone: string;
	message: string;
	travelerCount: number;
	specialRequirements: string;
	package: mongoose.Schema.Types.ObjectId;
}

const callbackSchema = new mongoose.Schema<ICallback>(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		travelerCount: {
			type: Number,
			required: true,
		},
		specialRequirements: {
			type: String,
			required: true,
		},
		package: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Package",
			required: true,
		},
	},
	{ timestamps: true },
);

const CallbackModel = mongoose.models.Callback || mongoose.model("Callback", callbackSchema);
export { CallbackModel };
