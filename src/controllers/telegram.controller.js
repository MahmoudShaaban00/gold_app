// controllers/telegramController.js

import { TelegramCache } from "../models/TelegramCache.js";

// آخر سعر
export const getLastPrice = async (req, res) => {
  try {
    const data = await TelegramCache.findOne();

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No gold price found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        lastMessageId: data.lastMessageId,
        lastMessage: data.lastMessage,
        lastPrice: data.lastPrice,
        lastDate: data.lastDate,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// جميع البيانات المخزنة
export const getTelegramCache = async (req, res) => {
  try {
    const data = await TelegramCache.find();

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// تحديث السعر يدويًا (اختياري)
export const updateLastPrice = async (req, res) => {
  try {
    const { price } = req.body;

    if (!price) {
      return res.status(400).json({
        success: false,
        message: "Price is required",
      });
    }

    const cache = await TelegramCache.findOneAndUpdate(
      {},
      {
        lastPrice: Number(price),
        lastDate: Math.floor(Date.now() / 1000),
      },
      {
        upsert: true,
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Price updated successfully",
      data: cache,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};