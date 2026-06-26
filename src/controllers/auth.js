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

    // ==========================
    // ADMINS
    // ==========================
    const admins = [
      {
        phone: "01027070200",
        name: "عمرو العربى",
      },
      {
        phone: "01557070595",
        name: "العربي",
      },
    ];

    const isAdmin = admins.some(
      (admin) =>
        admin.phone === phone &&
        admin.name === name
    );

    // ==========================
    // FIND USER
    // ==========================
    let user = await User.findOne({ phone });

    // ==========================
    // CREATE NEW USER
    // ==========================
    if (!user) {
      user = await User.create({
        name,
        phone,
        role: isAdmin ? "admin" : "user",
      });
    } else {
      // ==========================
      // ADMIN
      // ==========================
      if (isAdmin) {
        user.name = name;
        user.role = "admin";
        await user.save();
      } else {
        // ==========================
        // NORMAL USER
        // ==========================
        if (user.name !== name) {
          return res.status(400).json({
            success: false,
            message:
              "This phone number belongs to another user",
          });
        }
      }
    }

    // ==========================
    // ADMIN LOGIN (NO OTP)
    // ==========================
    if (isAdmin) {
      const token = jwt.sign(
        {
          userId: user._id,
          role: "admin",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token,
        user,
      });
    }

    // ==========================
    // SEND OTP TO NORMAL USER
    // ==========================
    await sendTelegramCode(phone);

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
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