import mongoose, { Document, Schema, Types } from "mongoose";

interface IReview extends Document {
	user: Types.ObjectId;
	package: Types.ObjectId;
	rating: number;
	comment: string;
}

const reviewSchema = new Schema<IReview>(
	{
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
			validate: {
				validator: Number.isInteger,
				message: "{VALUE} is not an integer rating",
			},
		},
		comment: {
			type: String,
			required: true,
			trim: true,
			maxlength: 500,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		package: {
			type: Schema.Types.ObjectId,
			ref: "Package",
			required: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

const ReviewModel = mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
export { ReviewModel };
