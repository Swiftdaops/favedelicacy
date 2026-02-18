import { Router } from "express";
import {
  createDrink,
  getDrinks,
  updateDrink,
  deleteDrink,
} from "../controllers/drink.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", getDrinks);
// public create for development convenience
router.post("/public", upload.array("images", 5), createDrink);
router.post("/", verifyAdmin, upload.array("images", 5), createDrink);
router.put("/:id", verifyAdmin, upload.array("images", 5), updateDrink);
router.delete("/:id", verifyAdmin, deleteDrink);

export default router;
