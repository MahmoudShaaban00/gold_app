import { Router } from "express";
import { createCategory, getCategories, deleteCategory, getCategoryById,updateCategory} from "../controllers/category.js";

const router = Router();

router.post("/", createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById); // 👈 الجديد
router.put("/:id", updateCategory); // 👈 الجديد
router.delete("/:id", deleteCategory);

export default router;