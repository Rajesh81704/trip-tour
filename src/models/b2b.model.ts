import mongoose, { Document } from "mongoose";

// export enum InquiryType {
// 	CorporatePackages = "Corporate Packages",
// 	GroupTours = "Group Tours",
// 	MICE = "MICE (Meetings, Incentives, Conferences, Events)",
// 	CustomItineraries = "Custom Itineraries",
// 	PartnershipOpportunities = "Partnership Opportunities",
// 	Other = "Other",
// }

interface IB2B extends Document {
	companyName: string;
	email: string;
	phone: string;
	website: string;
	message: string;
	contactName?: string;
	inquiryType: string;
}

const b2bSchema = new mongoose.Schema<IB2B>(
	{
		companyName: {
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
		website: {
			type: String,
			required: false,
		},
		message: {
			type: String,
			required: true,
		},
		contactName: {
			type: String,
		},
		inquiryType: {
			type: String,

			required: true,
		},
	},
	{ timestamps: true },
);

const B2BModel = mongoose.models.B2B || mongoose.model("B2B", b2bSchema);
export { B2BModel, IB2B };
