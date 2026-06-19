import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import { sendTelegramCode } from "../services/telegram.js";

export const login = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone is required",
      });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        name: name || "unknown",
        phone,
      });
    }

    // 🔥 SEND OTP AUTOMATICALLY
    await sendTelegramCode(phone);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent to Telegram",
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};