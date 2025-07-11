import mongoose, { Document, Schema, Types } from "mongoose";

interface IReview extends Document {
	crtDate: any;
	createdAt: Date;
	rating: number;
	review: string;
	user: Types.ObjectId;
	applaud: number;
	package: Types.ObjectId;
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
		review: {
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
		applaud: {
			type: Number,
			default: 0,
			min: 0,
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

reviewSchema.virtual("crtDate").get(function (this: IReview) {
	return this.createdAt;
});

const ReviewModel = mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
export default ReviewModel;
