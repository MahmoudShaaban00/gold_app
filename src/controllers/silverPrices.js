import { SilverPrice } from "../models/silverPrice.js";

// ======================
// Create Silver Price
// ======================
export const createSilverPrice = async (req, res) => {
  try {
    const { silver1000Buy, silver1000Sell } = req.body;

    if (!silver1000Buy || !silver1000Sell) {
      return res.status(400).json({
        success: false,
        message: "يجب إدخال سعر الفضة 1000 شراء وبيع",
      });
    }

    // 925
    const silver925Buy = Number(
      ((silver1000Buy * 925) / 1000).toFixed(2)
    );

    const silver925Sell = Number(
      ((silver1000Sell * 925) / 1000).toFixed(2)
    );

    // 800
    const silver800Buy = Number(
      ((silver1000Buy * 800) / 1000).toFixed(2)
    );

    const silver800Sell = Number(
      ((silver1000Sell * 800) / 1000).toFixed(2)
    );

    const data = await SilverPrice.create({
      silver1000Buy,
      silver1000Sell,

      silver925Buy,
      silver925Sell,

      silver800Buy,
      silver800Sell,
    });

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================
// Get All Prices
// ======================
export const getSilverPrices = async (req, res) => {
  try {
    const data = await SilverPrice.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================
// Get Price By ID
// ======================
export const getSilverPriceById = async (req, res) => {
  try {
    const { id } = req.params;

    const silverPrice = await SilverPrice.findById(id);

    if (!silverPrice) {
      return res.status(404).json({
        success: false,
        message: "سعر الفضة غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      data: silverPrice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================
// Update Price
// ======================
export const updateSilverPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { silver1000Buy, silver1000Sell } = req.body;

    if (!silver1000Buy || !silver1000Sell) {
      return res.status(400).json({
        success: false,
        message: "يجب إدخال سعر الفضة 1000 شراء وبيع",
      });
    }

    const silver925Buy = Number(
      ((silver1000Buy * 925) / 1000).toFixed(2)
    );

    const silver925Sell = Number(
      ((silver1000Sell * 925) / 1000).toFixed(2)
    );

    const silver800Buy = Number(
      ((silver1000Buy * 800) / 1000).toFixed(2)
    );

    const silver800Sell = Number(
      ((silver1000Sell * 800) / 1000).toFixed(2)
    );

    const silverPrice = await SilverPrice.findByIdAndUpdate(
      id,
      {
        silver1000Buy,
        silver1000Sell,

        silver925Buy,
        silver925Sell,

        silver800Buy,
        silver800Sell,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!silverPrice) {
      return res.status(404).json({
        success: false,
        message: "سعر الفضة غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      message: "تم تحديث السعر بنجاح",
      data: silverPrice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================
// Delete Price
// ======================
export const deleteSilverPrice = async (req, res) => {
  try {
    const { id } = req.params;

    const silverPrice = await SilverPrice.findByIdAndDelete(id);

    if (!silverPrice) {
      return res.status(404).json({
        success: false,
        message: "سعر الفضة غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      message: "تم حذف سعر الفضة بنجاح",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};