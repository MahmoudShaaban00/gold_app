import express from "express";
import { sendOtp } from "../controllers/sendOTP.js";
import { verifyOtp } from "../controllers/verifyOTP.js";
const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;