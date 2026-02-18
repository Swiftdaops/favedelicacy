import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import { uploadSingleToCloudinary } from "../utils/cloudinaryUpload.js";
import AdminModel from "../models/admin.model.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log(`Login attempt for: ${email}`);
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      console.warn(`Login failed: admin not found (${email})`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      console.warn(`Login failed: invalid password for ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isProd = process.env.NODE_ENV === "production";

    // Cross-site cookie support:
    // - When frontend and backend are on different domains, the browser will only
    //   send cookies if SameSite is "none" and Secure is true.
    // - In local dev (http), keep Secure false.
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);
    console.log(`Login successful for: ${email}`);
    res.json({ message: "Login successful" });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  res.json({ message: "Logged out" });
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
