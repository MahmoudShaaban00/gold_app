import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import { sendTelegramCode } from "../services/telegram.js";

export const login = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    let user = await User.findOne({ phone });

    // لو الرقم موجود والاسم مختلف
    if (user && user.name !== name) {
      return res.status(400).json({
        success: false,
        message: "This phone number belongs to another user",
      });
    }

    // إنشاء مستخدم جديد إذا لم يكن موجوداً
    if (!user) {
      user = await User.create({
        name,
        phone,
      });
    }

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