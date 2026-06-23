import { Router } from "express";
import { createCategory, getCategories, deleteCategory, getCategoryById,updateCategory} from "../controllers/category.js";
import {authMiddleware , adminMiddleware} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, adminMiddleware, createCategory);
router.get("/", authMiddleware,adminMiddleware, getCategories);
router.get("/:id", authMiddleware, adminMiddleware, getCategoryById); // 👈 الجديد
router.put("/:id", authMiddleware, adminMiddleware, updateCategory); // 👈 الجديد
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

export default router;