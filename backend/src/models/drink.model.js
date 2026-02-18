import mongoose from "mongoose";

const drinkSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    isAvailable: { type: Boolean, default: true },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Drink", drinkSchema);
