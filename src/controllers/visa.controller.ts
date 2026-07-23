import { Request, Response } from "express";
import { VisaInquiryModel } from "@/models/visa.model";
import { VisaPackageModel } from "@/models/visaPackage.model";
import { IUser } from "@/models/user.model";

const DEFAULT_VISA_PACKAGES = [
  {
    country: "Dubai (UAE)",
    flag: "🇦🇪",
    visaType: "Tourist & Express Visa",
    processingTime: "24 - 48 Hours",
    validity: "30 / 60 Days",
    price: "₹6,999",
    popular: true,
    isActive: true,
  },
  {
    country: "Singapore",
    flag: "🇸🇬",
    visaType: "E-Visa",
    processingTime: "3 - 4 Days",
    validity: "up to 2 Years",
    price: "₹3,499",
    popular: true,
    isActive: true,
  },
  {
    country: "Thailand",
    flag: "🇹🇭",
    visaType: "Visa On Arrival / E-Visa",
    processingTime: "Instant / 2 Days",
    validity: "30 Days",
    price: "₹2,999",
    popular: true,
    isActive: true,
  },
  {
    country: "Europe (Schengen)",
    flag: "🇪🇺",
    visaType: "Tourist & Business",
    processingTime: "10 - 15 Days",
    validity: "90 Days",
    price: "₹9,999",
    popular: false,
    isActive: true,
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    visaType: "Standard Visitor Visa",
    processingTime: "15 Days",
    validity: "6 Months",
    price: "₹12,499",
    popular: false,
    isActive: true,
  },
  {
    country: "United States (USA)",
    flag: "🇺🇸",
    visaType: "B1/B2 Tourist Visa",
    processingTime: "Slot Appointment",
    validity: "10 Years",
    price: "₹15,999",
    popular: false,
    isActive: true,
  },
];

const seedDefaultPackagesIfEmpty = async () => {
  try {
    const count = await VisaPackageModel.countDocuments();
    if (count === 0) {
      await VisaPackageModel.insertMany(DEFAULT_VISA_PACKAGES);
      console.log("Seeded default visa packages");
    }
  } catch (err) {
    console.error("Error auto-seeding visa packages:", err);
  }
};

export const getPublicVisaPackages = async (_req: Request, res: Response) => {
  try {
    await seedDefaultPackagesIfEmpty();
    const visaPackages = await VisaPackageModel.find({ isActive: true }).sort({ createdAt: 1 });
    return res.status(200).json({
      success: true,
      visaPackages,
    });
  } catch (error) {
    console.error("Error in getPublicVisaPackages:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllVisaPackages = async (_req: Request, res: Response) => {
  try {
    await seedDefaultPackagesIfEmpty();
    const visaPackages = await VisaPackageModel.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      visaPackages,
    });
  } catch (error) {
    console.error("Error in getAllVisaPackages:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createVisaPackage = async (req: Request, res: Response) => {
  try {
    const { country, flag, visaType, processingTime, validity, price, popular, description, requirements, isActive } = req.body;

    if (!country || !visaType || !processingTime || !validity || !price) {
      return res.status(400).json({
        success: false,
        message: "Country, visaType, processingTime, validity, and price are required.",
      });
    }

    const existingPackage = await VisaPackageModel.findOne({ country });
    if (existingPackage) {
      return res.status(400).json({
        success: false,
        message: `Visa package for ${country} already exists.`,
      });
    }

    const visaPackage = await VisaPackageModel.create({
      country,
      flag: flag || "🌐",
      visaType,
      processingTime,
      validity,
      price,
      popular: popular ?? false,
      description: description || "",
      requirements: requirements || [],
      isActive: isActive ?? true,
    });

    return res.status(201).json({
      success: true,
      message: "Visa package created successfully!",
      visaPackage,
    });
  } catch (error) {
    console.error("Error in createVisaPackage:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateVisaPackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const visaPackage = await VisaPackageModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!visaPackage) {
      return res.status(404).json({ success: false, message: "Visa package not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Visa package updated successfully!",
      visaPackage,
    });
  } catch (error) {
    console.error("Error in updateVisaPackage:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteVisaPackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const visaPackage = await VisaPackageModel.findByIdAndDelete(id);
    if (!visaPackage) {
      return res.status(404).json({ success: false, message: "Visa package not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Visa package deleted successfully!",
    });
  } catch (error) {
    console.error("Error in deleteVisaPackage:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createVisaInquiry = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, country, visaType, passportNumber, travelDate, message } = req.body;

    if (!name || !email || !phone || !country) {
      return res.status(400).json({ success: false, message: "Name, email, phone, and country are required." });
    }

    const visaInquiry = await VisaInquiryModel.create({
      name,
      email,
      phone,
      country,
      visaType: visaType || "Tourist Visa",
      passportNumber: passportNumber || "",
      travelDate: travelDate || "",
      message: message || "",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Visa application/inquiry submitted successfully!",
      visaInquiry,
    });
  } catch (error) {
    console.error("Error in createVisaInquiry:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyVisaInquiries = async (req: Request, res: Response) => {
  try {
    const reqUser = req.user as IUser;
    if (!reqUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userEmail = reqUser.email ? reqUser.email.trim() : "";
    const userPhone = reqUser.phone ? reqUser.phone.trim() : "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any[] = [];
    if (userEmail) {
      const escapedEmail = userEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.push({ email: { $regex: new RegExp(`^${escapedEmail}$`, "i") } });
    }
    if (userPhone) {
      const escapedPhone = userPhone.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.push({ phone: { $regex: new RegExp(`^${escapedPhone}$`, "i") } });
    }

    const visaInquiries = await VisaInquiryModel.find(
      query.length > 0 ? { $or: query } : { email: userEmail }
    ).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      visaInquiries,
    });
  } catch (error) {
    console.error("Error in getMyVisaInquiries:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllVisaInquiries = async (_req: Request, res: Response) => {
  try {
    const visaInquiries = await VisaInquiryModel.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      visaInquiries,
    });
  } catch (error) {
    console.error("Error in getAllVisaInquiries:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateVisaInquiryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "in-review", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const visaInquiry = await VisaInquiryModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!visaInquiry) {
      return res.status(404).json({ success: false, message: "Visa inquiry not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      visaInquiry,
    });
  } catch (error) {
    console.error("Error in updateVisaInquiryStatus:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteVisaInquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const visaInquiry = await VisaInquiryModel.findByIdAndDelete(id);
    if (!visaInquiry) {
      return res.status(404).json({ success: false, message: "Visa inquiry not found" });
    }
    return res.status(200).json({ success: true, message: "Visa inquiry deleted successfully" });
  } catch (error) {
    console.error("Error in deleteVisaInquiry:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
