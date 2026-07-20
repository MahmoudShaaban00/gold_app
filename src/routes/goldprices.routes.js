import { Router } from "express";
import {createGoldPrice, getGoldPrice,deleteGoldPrice, getGoldPriceById} from "../controllers/goldprices.js";
import {authMiddleware , adminMiddleware} from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/", authMiddleware, adminMiddleware, createGoldPrice);
router.get("/", authMiddleware, getGoldPrice);
router.get("/:id", authMiddleware, getGoldPriceById);
router.delete("/:id", authMiddleware, adminMiddleware, deleteGoldPrice);

export default router;