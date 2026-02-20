import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    cid: { type: String },
    message: { type: String, required: true },
    isNewCustomer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ phone: 1, createdAt: -1 });

export default mongoose.model("ContactMessage", contactMessageSchema);
