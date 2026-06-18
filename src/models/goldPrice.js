import mongoose from "mongoose";

const goldSchema = new mongoose.Schema(
  {
    price: Number,
    message: String
  },
  {
    timestamps: true
  }
);

export const GoldPrice =
  mongoose.models.GoldPrice ||
  mongoose.model("GoldPrice", goldSchema);