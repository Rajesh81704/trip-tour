import mongoose, { Document } from "mongoose";

export interface IVisaInquiry extends Document {
  name: string;
  email: string;
  phone: string;
  country: string;
  visaType: string;
  passportNumber?: string;
  travelDate?: string;
  message?: string;
  status: "pending" | "in-review" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const visaInquirySchema = new mongoose.Schema<IVisaInquiry>(
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
    country: {
      type: String,
      required: true,
    },
    visaType: {
      type: String,
      required: true,
      default: "Tourist Visa",
    },
    passportNumber: {
      type: String,
      required: false,
    },
    travelDate: {
      type: String,
      required: false,
    },
    message: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "in-review", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const VisaInquiryModel =
  mongoose.models.VisaInquiry || mongoose.model<IVisaInquiry>("VisaInquiry", visaInquirySchema);

export { VisaInquiryModel };
