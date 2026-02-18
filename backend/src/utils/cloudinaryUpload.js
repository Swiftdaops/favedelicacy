import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const uploadWithTimeout = async (dataUri, options = {}, { timeout = 30000, retries = 1 } = {}) => {
  let lastErr = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const uploadPromise = cloudinary.uploader.upload(dataUri, options);

      const result = await Promise.race([
        uploadPromise,
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error("Cloudinary upload timeout")), timeout)
        ),
      ]);

      return result;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await sleep(1000 * (attempt + 1));
      }
    }
  }

  throw lastErr;
};

export const uploadToCloudinary = async (files = []) => {
  const uploads = [];

  for (const file of files) {
    try {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

      const result = await uploadWithTimeout(dataUri, {
        folder: process.env.CLOUDINARY_FOLDER,
      }, { timeout: 30000, retries: 2 });

      uploads.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (err) {
      console.error("Cloudinary upload failed for file:", err && err.message ? err.message : err);
      if (err && err.http_code) console.error("Cloudinary http_code:", err.http_code);
      throw err;
    }
  }

  return uploads;
};

export const uploadSingleToCloudinary = async (file) => {
  try {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const result = await uploadWithTimeout(dataUri, {
      folder: process.env.CLOUDINARY_FOLDER,
    }, { timeout: 30000, retries: 2 });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (err) {
    console.error("Cloudinary upload failed (single):", err && err.message ? err.message : err);
    if (err && err.http_code) console.error("Cloudinary http_code:", err.http_code);
    throw err;
  }
};
