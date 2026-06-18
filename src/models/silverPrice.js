import mongoose from "mongoose";

const silverPriceSchema = new mongoose.Schema(
  {
    silver925Buy: {
      type: Number,
      required: true,
    },
    silver925Sell: {
      type: Number,
      required: true,
    },

    silver1000Buy: Number,
    silver1000Sell: Number,

    silver800Buy: Number,
    silver800Sell: Number,
  },
  {
    timestamps: true,
  }
);

export const SilverPrice = mongoose.model(
  "SilverPrice",
  silverPriceSchema
);