import {
  sendTelegramCode,
  verifyTelegramCode,
} from "../services/telegram.js";

// ==========================
// SEND CODE
// ==========================
export const sendCode = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone is required",
      });
    }

    const result = await sendTelegramCode(phone);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// VERIFY CODE
// ==========================
export const verifyCode = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: "Phone and code required",
      });
    }

    const result = await verifyTelegramCode(phone, code);

    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};