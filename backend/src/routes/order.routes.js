import { Router } from "express";
import {
  createOrder,
  getOrders,
  getPendingCount,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", createOrder);          // customer
router.get("/", verifyAdmin, getOrders);
router.get("/pending-count", verifyAdmin, getPendingCount);
router.patch("/:id/status", verifyAdmin, updateOrderStatus);
router.delete("/:id", verifyAdmin, deleteOrder);

export default router;
