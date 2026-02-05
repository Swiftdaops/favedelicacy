import { Router } from "express";
import {
  createCategory,
  getCategories,
  deleteCategory,
} from "../controllers/category.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getCategories);
router.post("/", verifyAdmin, createCategory);
router.delete("/:id", verifyAdmin, deleteCategory);

export default router;
