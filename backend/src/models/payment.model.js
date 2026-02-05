import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },

    proof: {
      url: String,
      publicId: String,
    },

    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
