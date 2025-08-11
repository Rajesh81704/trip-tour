import mongoose, { Document, Types } from "mongoose";

interface IPackage extends Document {
	title: string;
	description: string;
	location: {
		city: string;
		state: string;
		destination: string;
	};
	duration: {
		day: number;
		night: number;
	};
	price: number;
	reviews: Types.ObjectId[];
	images: {
		url: string;
		public_id: string;
	}[];
	features: string[];
	discount: number;
	highlights: string[];
	itinerary: {
		day: number;
		title: string;
		description: string;
	}[];
	inclusions: string[];
	exclusions: string[];
	category: string;
}

const packageSchema = new mongoose.Schema<IPackage>(
	{
		title: {
			type: String,
			required: true,
		},
		location: {
			city: {
				type: String,
				required: true,
			},
			state: {
				type: String,
				required: true,
			},
			destination: {
				type: String,
				required: true,
			},
		},
		duration: {
			day: {
				type: Number,
				required: true,
			},
			night: {
				type: Number,
			},
		},
		price: {
			type: Number,
			required: true,
		},
		discount: {
			type: Number,
			required: true,
		},
		reviews: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Review",
			},
		],
		images: {
			type: [
				{
					url: {
						type: String,
						required: true,
					},
					public_id: {
						type: String,
						required: true,
					},
				},
			],
			required: true,
		},
		features: {
			type: [String],
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		highlights: {
			type: [String],
			required: true,
		},
		itinerary: {
			type: [
				{
					day: {
						type: Number,
						required: true,
					},
					title: {
						type: String,
						required: true,
					},
					description: {
						type: String,
						required: true,
					},
				},
			],
		},
		inclusions: {
			type: [String],
			required: true,
		},
		exclusions: {
			type: [String],
			required: true,
		},
		category: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

const PackageModel = mongoose.models.Package || mongoose.model("Package", packageSchema);
export { PackageModel, IPackage };
