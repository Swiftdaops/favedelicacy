import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      url: String,
      publicId: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
