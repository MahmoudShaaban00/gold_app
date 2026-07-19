import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import {sendTelegramCode} from "../services/telegram.js";

// ======================================
// LOGIN
// ======================================
export const signin = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    // ======================================
    // ADMINS
    // ======================================
   const admins = [
  {
    phone: "+201027070200",
    name: "عمرو العربى",
  },
  {
      phone: "+201557070595",
      name: "العربي",
  },
];
    const isAdmin = admins.some(
      (admin) =>
        admin.phone === phone &&
        admin.name === name
    );

    // ======================================
    // FIND USER
    // ======================================
    let user = await User.findOne({ phone });

    // ======================================
    // CREATE USER
    // ======================================
    if (!user) {
      user = await User.create({
        name,
        phone,
        role: isAdmin ? "admin" : "user",
      });
    } else {
      if (isAdmin) {
        user.name = name;
        user.role = "admin";
        await user.save();
      } else {
        if (user.name !== name) {
          return res.status(400).json({
            success: false,
            message: "This phone number belongs to another user",
          });
        }
      }
    }

        await sendTelegramCode(phone);


    // ======================================
    // ACCESS TOKEN
    // ======================================
  const accessToken = jwt.sign(
  {
    userId: user._id,
    role: user.role,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1y",
  }
);

const refreshToken = jwt.sign(
  {
    userId: user._id,
  },
  process.env.JWT_REFRESH_SECRET,
  {
    expiresIn: "1y",
  }
);

// اطبع القيم هنا
console.log("Access Token:", accessToken);
console.log("Refresh Token:", refreshToken);
console.log("JWT_SECRET:", process.env.JWT_SECRET);

return res.status(200).json({
  success: true,
  message: "Login successful",
  accessToken,
  refreshToken,
  user,
});
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// REFRESH TOKEN
// ======================================
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1y",
      }
    );

    const newRefreshToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "1y",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }

};

// ======================================
// GET ALL USERS
// ======================================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};