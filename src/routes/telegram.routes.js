import { Router } from "express";
import {
  sendCode,
  verifyCode,
} from "../controllers/telegram.js";

import {authMiddleware} from "../middlewares/auth.middleware.js";


const router = Router();

router.post("/send-code", sendCode);
router.post("/verify-code", authMiddleware, verifyCode);

export default router;