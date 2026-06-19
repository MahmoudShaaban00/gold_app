import { Router } from "express";
import {
  createSilverPrice,
  getSilverPrices,
  getSilverPriceById,
  deleteSilverPrice,
} from "../controllers/silverPrices.js";

import {authMiddleware} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createSilverPrice);
router.get("/", authMiddleware, getSilverPrices);
router.get("/:id", authMiddleware, getSilverPriceById);
router.delete("/:id", authMiddleware, deleteSilverPrice);

export default router;