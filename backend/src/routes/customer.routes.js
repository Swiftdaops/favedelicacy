import { Router } from "express";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import {
  listCustomers,
  getCustomer,
  getCustomerOrders,
} from "../controllers/customer.controller.js";

const router = Router();

router.get("/", verifyAdmin, listCustomers);
router.get("/:id/orders", verifyAdmin, getCustomerOrders);
router.get("/:id", verifyAdmin, getCustomer);

export default router;
