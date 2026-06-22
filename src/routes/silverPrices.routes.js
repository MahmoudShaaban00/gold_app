import { Router } from "express";
import {
  createSilverPrice,
  getSilverPrices,
  getSilverPriceById,
  deleteSilverPrice,
  updateSilverPrice
} from "../controllers/silverPrices.js";

import {authMiddleware , adminMiddleware} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, adminMiddleware, createSilverPrice);
router.get("/", authMiddleware, getSilverPrices);
router.get("/:id", authMiddleware, getSilverPriceById);
router.delete("/:id", authMiddleware, adminMiddleware, deleteSilverPrice);
router.put("/:id", authMiddleware, adminMiddleware, updateSilverPrice);


export default router;