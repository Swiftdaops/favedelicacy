import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    cid: { type: String, unique: true, sparse: true, trim: true },
    phone: { type: String, index: true, required: true, trim: true },
    email: { type: String, index: true, sparse: true, lowercase: true, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
