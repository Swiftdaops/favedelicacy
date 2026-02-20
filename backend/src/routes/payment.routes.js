import { Router } from "express";
import {
  uploadPaymentProof,
  getPayments,
  verifyPayment,
  unverifyPayment,
  deletePayment,
} from "../controllers/payment.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", upload.single("proof"), uploadPaymentProof);
router.get("/", verifyAdmin, getPayments);
router.patch("/:id/verify", verifyAdmin, verifyPayment);
router.patch("/:id/unverify", verifyAdmin, unverifyPayment);
router.delete("/:id", verifyAdmin, deletePayment);

export default router;
