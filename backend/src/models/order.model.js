import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    deliveryAddress: String,

    items: [
      {
        food: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "paid", "confirmed", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1, status: 1 });

export default mongoose.model("Order", orderSchema);
