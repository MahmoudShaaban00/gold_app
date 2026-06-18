import mongoose from "mongoose";

const goldPriceSchema = new mongoose.Schema(
  {
    buy21: Number,
    sell21: Number,

    buy24: Number,
    sell24: Number,

    buy18: Number,
    sell18: Number,
  },
  { timestamps: true }
);

export const GoldPrice = mongoose.model("GoldPrice",goldPriceSchema);