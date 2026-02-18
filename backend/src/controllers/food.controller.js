import Food from "../models/food.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

export const getFoods = async (req, res, next) => {
  try {
    const filter =
      req.query.all === "true"
        ? {}
        : { $or: [{ hidden: false }, { hidden: { $exists: false } }] };
    const foods = await Food.find(filter).populate("category");
    res.json(foods);
  } catch (err) {
    next(err);
  }
};

export const createFood = async (req, res, next) => {
  try {
    let images = [];
    if (req.files?.length) {
      try {
        images = await uploadToCloudinary(req.files);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    const payload = { ...req.body, images };
    if (payload.price) payload.price = Number(payload.price);

    // Parse extras if sent as JSON string (from FormData)
    if (payload.extras && typeof payload.extras === "string") {
      try {
        const parsed = JSON.parse(payload.extras);
        payload.extras = Array.isArray(parsed)
          ? parsed.map((e) => ({ name: e.name, price: Number(e.price) || 0 }))
          : [];
      } catch (err) {
        payload.extras = [];
      }
    }

    const food = await Food.create(payload);
    res.status(201).json(food);
  } catch (err) {
    next(err);
  }
};

export const updateFood = async (req, res, next) => {
  try {
    // Load existing food to manage images safely
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });

    let data = { ...req.body };

    // Handle removal of existing images (expecting JSON string or array of publicIds)
    let currentImages = Array.isArray(food.images) ? [...food.images] : [];
    const removeImageIdsRaw = data.removeImageIds || data.removeImages || null;
    if (removeImageIdsRaw) {
      let removeIds = [];
      if (typeof removeImageIdsRaw === "string") {
        try { removeIds = JSON.parse(removeImageIdsRaw); } catch { removeIds = []; }
      } else if (Array.isArray(removeImageIdsRaw)) {
        removeIds = removeImageIdsRaw;
      }

      for (const pid of removeIds) {
        try {
          await deleteFromCloudinary(pid);
        } catch (err) {
          console.warn("Failed to delete cloudinary image", pid, err && err.message ? err.message : err);
        }
      }

      currentImages = currentImages.filter((img) => !removeIds.includes(img.publicId));
    }

    // Upload new images (if any) and append to existing images
    if (req.files?.length) {
      try {
        const uploaded = await uploadToCloudinary(req.files);
        currentImages = [...currentImages, ...uploaded];
      } catch (err) {
        console.error("Cloudinary upload failed (update):", err);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    data.images = currentImages;

    if (data.price) data.price = Number(data.price);

    // Parse extras if provided as JSON string
    if (data.extras && typeof data.extras === "string") {
      try {
        const parsed = JSON.parse(data.extras);
        data.extras = Array.isArray(parsed)
          ? parsed.map((e) => ({ name: e.name, price: Number(e.price) || 0 }))
          : [];
      } catch (err) {
        data.extras = [];
      }
    }

    const updated = await Food.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json(food);
  } catch (err) {
    next(err);
  }
};

export const deleteFood = async (req, res, next) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food deleted" });
  } catch (err) {
    next(err);
  }
};
