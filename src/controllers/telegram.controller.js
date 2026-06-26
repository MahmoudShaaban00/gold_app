import { TelegramCache } from "../models/TelegramCache.js";

export const getLastTelegramMessage = async (req, res) => {
  try {
    console.log("GET /api/telegram-cache/last");

    const data = await TelegramCache.findOne();

    console.log("Cache:", data);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};