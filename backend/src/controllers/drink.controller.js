import Drink from "../models/drink.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export const getDrinks = async (req, res, next) => {
  try {
    const filter =
      req.query.all === "true"
        ? {}
        : { $or: [{ hidden: false }, { hidden: { $exists: false } }] };
    const drinks = await Drink.find(filter);
    res.json(drinks);
  } catch (err) {
    next(err);
  }
};

export const createDrink = async (req, res, next) => {
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

    const drink = await Drink.create(payload);
    res.status(201).json(drink);
  } catch (err) {
    next(err);
  }
};

export const updateDrink = async (req, res, next) => {
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

    const drink = await Drink.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!drink) return res.status(404).json({ message: "Drink not found" });
    res.json(drink);
  } catch (err) {
    next(err);
  }
};

export const deleteDrink = async (req, res, next) => {
  try {
    await Drink.findByIdAndDelete(req.params.id);
    res.json({ message: "Drink deleted" });
  } catch (err) {
    next(err);
  }
};
