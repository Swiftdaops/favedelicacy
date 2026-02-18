import Food from "../models/food.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

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
    let data = { ...req.body };

    if (req.files?.length) {
      try {
        data.images = await uploadToCloudinary(req.files);
      } catch (err) {
        console.error("Cloudinary upload failed (update):", err);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

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

    const food = await Food.findByIdAndUpdate(req.params.id, data, { new: true });
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
