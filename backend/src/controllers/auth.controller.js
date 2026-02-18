import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import { uploadSingleToCloudinary } from "../utils/cloudinaryUpload.js";
import AdminModel from "../models/admin.model.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate Token
    const token = jwt.sign(
      { adminId: admin._id }, // Ensure this matches req.adminId in your middleware
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isProd = process.env.NODE_ENV === "production";

    // 🚀 PRODUCTION COOKIE STRATEGY
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    // Safety-net: allow local dev on localhost without Secure/SameSite=None
    if (!isProd && req.hostname === 'localhost') {
      cookieOptions.secure = false;
      cookieOptions.sameSite = "lax";
    }

    res.cookie("token", token, cookieOptions);
    res.json({ 
      success: true, 
      message: "Login successful",
      data: { email: admin.email, avatar: admin.avatar } 
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  // To clear a cross-site cookie, you MUST pass the same options 
  // (secure, sameSite) as when you set it.
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.json({ message: "Logged out successfully" });
};

export const getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.adminId).select("email avatar");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ data: admin });
  } catch (err) {
    next(err);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.files || !req.files.length) return res.status(400).json({ message: "No file provided" });

    const file = req.files[0];
    let uploaded;
    try {
      uploaded = await uploadSingleToCloudinary(file);
    } catch (err) {
      console.error("Cloudinary upload failed (avatar):", err.message || err);
      return res.status(500).json({ message: "Image upload failed" });
    }

    const admin = await Admin.findByIdAndUpdate(req.adminId, { avatar: uploaded }, { new: true }).select("email avatar");
    res.json({ data: admin });
  } catch (err) {
    next(err);
  }
};
