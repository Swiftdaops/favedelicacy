import { Router } from "express";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import {
  listCustomers,
  getCustomer,
  getCustomerOrders,
} from "../controllers/customer.controller.js";

const router = Router();

/**
 * Get all customers (Admin only)
 */
router.get("/", verifyAdmin, listCustomers);

/**
 * Get a specific customer's orders (Admin only)
 */
router.get("/:id/orders", verifyAdmin, getCustomerOrders);

/**
 * Get a specific customer by ID (Admin only)
 */
router.get("/:id", verifyAdmin, getCustomer);

export default router;
