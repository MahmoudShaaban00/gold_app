import { Router } from "express";
import {
  createCategory,
  getCategories,
  deleteCategory,
  getCategoryById,
} from "../controllers/category.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createCategory);
router.get("/", authMiddleware, getCategories);
router.get("/:id", authMiddleware, getCategoryById); // 👈 الجديد

router.delete("/:id", authMiddleware, deleteCategory);

export default router;