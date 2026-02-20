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

/**
 * Create a new order (Customer)
 */
router.post("/", createOrder);

/**
 * Get all orders (Admin only)
 */
router.get("/", verifyAdmin, getOrders);

/**
 * Get the count of pending orders (Admin only)
 */
router.get("/pending-count", verifyAdmin, getPendingCount);

/**
 * Update order status (Admin only)
 */
router.patch("/:id/status", verifyAdmin, updateOrderStatus);

/**
 * Delete an order (Admin only)
 */
router.delete("/:id", verifyAdmin, deleteOrder);

export default router;
