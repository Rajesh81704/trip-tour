import mongoose, { Document } from "mongoose";

export interface IVisaPackage extends Document {
  country: string;
  flag: string;
  visaType: string;
  processingTime: string;
  validity: string;
  price: string;
  popular: boolean;
  description?: string;
  requirements?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const visaPackageSchema = new mongoose.Schema<IVisaPackage>(
  {
    country: {
      type: String,
      required: true,
      unique: true,
    },
    flag: {
      type: String,
      default: "🌐",
    },
    visaType: {
      type: String,
      required: true,
    },
    processingTime: {
      type: String,
      required: true,
    },
    validity: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: false,
    },
    requirements: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const VisaPackageModel =
  mongoose.models.VisaPackage || mongoose.model<IVisaPackage>("VisaPackage", visaPackageSchema);

export { VisaPackageModel };
