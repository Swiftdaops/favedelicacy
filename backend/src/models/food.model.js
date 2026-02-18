import mongoose from "mongoose";

const extraSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
});

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true }, // Base price
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    // --- NEW ATTRIBUTES ---
    extras: [extraSchema], // List of available add-ons for this specific food
    isAvailable: { type: Boolean, default: true },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Food", foodSchema);
