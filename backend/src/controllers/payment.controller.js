import Payment from "../models/payment.model.js";
import { uploadSingleToCloudinary } from "../utils/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";

export const uploadPaymentProof = async (req, res, next) => {
  try {
    const proof = await uploadSingleToCloudinary(req.file);

    const payment = await Payment.create({
      order: req.body.orderId,
      customerName: req.body.customerName,
      amount: req.body.amount,
      proof,
    });

    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate("order")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    );
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

export const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // attempt to remove proof from Cloudinary if publicId exists
    try {
      if (payment.proof && payment.proof.publicId) {
        await cloudinary.uploader.destroy(payment.proof.publicId);
      }
    } catch (err) {
      // log and continue - deletion of cloudinary asset shouldn't block DB deletion
      console.error("Cloudinary destroy error:", err && err.message ? err.message : err);
    }

    await Payment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
