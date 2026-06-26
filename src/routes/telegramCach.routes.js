import { Router } from "express";
import { getLastTelegramMessage } from "../controllers/telegram.controller.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/last", authMiddleware, getLastTelegramMessage);

export default router;