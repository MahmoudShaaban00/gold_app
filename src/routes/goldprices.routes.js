import { Router } from "express";
import {createGoldPrice, getGoldPrice,deleteGoldPrice, getGoldPriceById} from "../controllers/goldprices.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createGoldPrice);
router.get("/", authMiddleware, getGoldPrice);
router.get("/:id", authMiddleware, getGoldPriceById);
router.delete("/:id", authMiddleware, deleteGoldPrice);

export default router;