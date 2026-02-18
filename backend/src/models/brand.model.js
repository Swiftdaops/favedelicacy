import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    themeColor: { type: String, default: "#16a34a" },
    logoUrl: String,
    currency: { type: String, default: "NGN" },
    contactPhone: String,
  },
  { timestamps: true }
);

export default mongoose.model("Brand", brandSchema);
