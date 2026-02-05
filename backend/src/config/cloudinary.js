// config/cloudinary.js

import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary configuration
 * Uses environment variables for security
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Helper function to upload files
 * @param {string} filePath - local file path
 * @param {string} folder - cloudinary folder name
 */
export const uploadToCloudinary = async (
  filePath,
  folder = "food-app"
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
      use_filename: true,
      unique_filename: true,
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    throw new Error("Cloudinary upload failed");
  }
};

export default cloudinary;
