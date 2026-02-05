import { Router } from "express";
import { login, logout, getProfile, updateAvatar } from "../controllers/auth.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);

router.get("/me", verifyAdmin, getProfile);
router.post("/avatar", verifyAdmin, upload.array("avatar", 1), updateAvatar);

export default router;
