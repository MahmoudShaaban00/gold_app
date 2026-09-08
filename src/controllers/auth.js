import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import { namesMatch } from "../utils/normalizeArabicName.js";
import { phonesMatch } from "../utils/normalizePhone.js";
import mongoose from "mongoose";

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
        // Compare names ignoring Arabic typing variations (ta marbuta vs
        // ha, alef forms, diacritics, whitespace). The phone still
        // identifies the account; this only relaxes the name check.
        if (!namesMatch(user.name, name)) {
          return res.status(400).json({
            success: false,
            message:
              "The name does not match the name registered with this phone number.",
          });
        }
      }
    }

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


return res.status(200).json({
  success: true,
  message: "Login successful",
  accessToken,
  refreshToken,
  user,
});
  } catch (error) {
    console.error("[auth] request failed:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
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
    console.error("[auth] request failed:", error);

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
    console.error("[auth] request failed:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// ======================================
// DELETE OWN ACCOUNT
// ======================================
// DELETE /api/auth/account
//
// The account that gets deleted is ALWAYS the one identified by the access
// token. The { name, phone } body is a confirmation step only: it is checked
// against the token's own account and is never used to look an account up, so
// no combination of body values can reach another user's row.
//
// Nothing from the body (or the stored account) is logged.
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.userId;

    // authMiddleware guarantees a verified token, but a token minted without
    // a userId claim must not fall through to a broad query.
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    const { name, phone } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Both checks share one response so the reply never reveals which of the
    // two values was wrong.
    if (!namesMatch(user.name, name) || !phonesMatch(user.phone, phone)) {
      return res.status(400).json({
        success: false,
        message: "The provided details do not match this account",
      });
    }

    // Scoped to the authenticated _id. No other collection references User,
    // so there is nothing owned by this account to cascade to: products,
    // categories, gold/silver prices and the Telegram cache are shared
    // application data and are deliberately left untouched.
    const result = await User.deleteOne({ _id: user._id });

    if (result.deletedCount !== 1) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("[auth] request failed:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
