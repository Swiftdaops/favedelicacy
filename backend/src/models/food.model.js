import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    isAvailable: { type: Boolean, default: true },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Food", foodSchema);
