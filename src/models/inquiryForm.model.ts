import mongoose from "mongoose";

interface InquiryForm {
	name: string;
	mobileNumber: string;
	email: string;
	destination: string;
	message: string;
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
	},
	{ timestamps: true },
);

const InquiryFormModel =
	mongoose.models.InquiryForm || mongoose.model<InquiryForm>("InquiryForm", inquiryFormSchema);

export { InquiryFormModel, InquiryForm };
