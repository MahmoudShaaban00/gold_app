import mongoose from "mongoose";

const telegramCacheSchema = new mongoose.Schema(
  {
    lastMessageId: Number,
    lastMessage: String,
    lastPrice: Number,
    lastDate: Date,
  },
  {
    timestamps: true,
  }
);

export const TelegramCache = mongoose.model(
  "TelegramCache",
  telegramCacheSchema
);