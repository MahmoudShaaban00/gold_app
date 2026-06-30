// routes/telegramRoutes.js

import express from "express";
import {
  getLastPrice,
  getTelegramCache,
  updateLastPrice,
} from "../controllers/telegram.controller.js";

const router = express.Router();

/**
 * GET /api/telegram/last-price
 * يرجع آخر سعر ذهب
 */
router.get("/last-price", getLastPrice);

/**
 * GET /api/telegram/cache
 * يرجع بيانات TelegramCache
 */
router.get("/cache", getTelegramCache);

/**
 * PUT /api/telegram/update-price
 * تحديث السعر يدويًا (اختياري)
 */
router.put("/update-price", updateLastPrice);

export default router;