import Brand from "../models/brand.model.js";

export const getBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findOne();
    res.json(brand);
  } catch (err) {
    next(err);
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );
    res.json(brand);
  } catch (err) {
    next(err);
  }
};
