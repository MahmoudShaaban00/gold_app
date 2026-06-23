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

    if (user && user.name !== name) {
      return res.status(400).json({
        success: false,
        message: "This phone number belongs to another user",
      });
    }

    if (!user) {
      user = await User.create({
        name,
        phone,
        role:
          phone === "01027070200" &&
          name === "عمرو العربى"
            ? "admin"
            : "user",
      });
    }

    // Admin Login بدون OTP
    if (
      user.phone === "01027070200" &&
      user.name === "عمرو العربى"
    ) {
      user.role = "admin";
      await user.save();

      const token = jwt.sign(
        {
          userId: user._id,
          role: "admin",
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token,
        user,
      });
    }

    // باقي المستخدمين يرسل لهم OTP
    await sendTelegramCode(phone);

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
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
}


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};