import { Router } from "express";
import {createCategory, getCategories} from "../controllers/category.js";

const router = Router();

router.post("/", createCategory);
router.get("/", getCategories);

export default router;