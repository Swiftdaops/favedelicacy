import { Router } from "express";
import {
  createFood,
  getFoods,
  updateFood,
  deleteFood,
} from "../controllers/food.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", getFoods);
// public create for admin UI (development convenience)
router.post("/public", upload.array("images", 5), createFood);
router.post("/", verifyAdmin, upload.array("images", 5), createFood);
router.put("/:id", verifyAdmin, upload.array("images", 5), updateFood);
router.delete("/:id", verifyAdmin, deleteFood);

export default router;
