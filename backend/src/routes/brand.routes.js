import { Router } from "express";
import { getBrand, updateBrand } from "../controllers/brand.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getBrand);
router.put("/", verifyAdmin, updateBrand);

export default router;
