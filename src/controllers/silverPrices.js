import { SilverPrice } from "../models/silverPrice.js";

export const createSilverPrice = async (req, res) => {
  try {
    const { silver925Buy, silver925Sell } = req.body;

    if (!silver925Buy || !silver925Sell) {
      return res.status(400).json({
        message: "يجب إدخال سعر 925 شراء وبيع",
      });
    }

    // الحسابات
    const silver1000Buy = Number(
      ((silver925Buy * 1000) / 925).toFixed(2)
    );
    const silver1000Sell = Number(
      ((silver925Sell * 1000) / 925).toFixed(2)
    );

    const silver800Buy = Number(
      ((silver925Buy * 800) / 925).toFixed(2)
    );
    const silver800Sell = Number(
      ((silver925Sell * 800) / 925).toFixed(2)
    );

    const data = await SilverPrice.create({
      silver925Buy,
      silver925Sell,
      silver1000Buy,
      silver1000Sell,
      silver800Buy,
      silver800Sell,
    });

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getSilverPrices = async (req, res) => {
  try {
    const data = await SilverPrice.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};