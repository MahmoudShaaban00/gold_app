import { GoldPrice } from "../models/goldPrices.js";

export const createGoldPrice = async (req, res) => {
  try {
    const { buy21, sell21 } = req.body;

    if (!buy21 || !sell21) {
      return res.status(400).json({
        message: "يجب إدخال سعر الشراء والبيع لعيار 21",
      });
    }

    const buy24 = Number(((buy21 * 24) / 21).toFixed(2));
    const sell24 = Number(((sell21 * 24) / 21).toFixed(2));

    const buy18 = Number(((buy21 * 18) / 21).toFixed(2));
    const sell18 = Number(((sell21 * 18) / 21).toFixed(2));

    const goldPrice = await GoldPrice.create({
      buy21,
      sell21,
      buy24,
      sell24,
      buy18,
      sell18,
    });

    res.status(201).json({
      success: true,
      data: goldPrice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGoldPrice = async (req, res) => {
  try {
    const prices = await GoldPrice.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: prices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGoldPriceById = async (req, res) => {
  try {
    const { id } = req.params;

    const goldPrice = await GoldPrice.findById(id);

    if (!goldPrice) {
      return res.status(404).json({
        success: false,
        message: "سعر الذهب غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      data: goldPrice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteGoldPrice = async (req, res) => {
  try {
    const { id } = req.params;

    const goldPrice = await GoldPrice.findByIdAndDelete(id);

    if (!goldPrice) {
      return res.status(404).json({
        success: false,
        message: "سعر الذهب غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      message: "تم حذف سعر الذهب بنجاح",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};