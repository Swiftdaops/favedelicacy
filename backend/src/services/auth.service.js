import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

export const authenticateAdmin = async (email, password) => {
  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { adminId: admin._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return token;
};
