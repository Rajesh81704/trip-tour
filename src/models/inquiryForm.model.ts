import mongoose from "mongoose";

interface InquiryForm {
	name: string;
	mobileNumber: string;
	email: string;
	destination: string;
	message: string;
	packageId?: mongoose.Schema.Types.ObjectId;
}

const inquiryFormSchema = new mongoose.Schema<InquiryForm>(
	{
		name: {
			type: String,
			required: true,
		},
		mobileNumber: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		destination: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		packageId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Package",
			required: false,
		},
	},
	{ timestamps: true },
);

const InquiryFormModel =
	mongoose.models.InquiryForm || mongoose.model<InquiryForm>("InquiryForm", inquiryFormSchema);

export { InquiryForm, InquiryFormModel };
