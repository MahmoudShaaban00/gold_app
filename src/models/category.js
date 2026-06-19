import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["gold", "silver", "used gold","used silver","Coins"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.model("Category",categorySchema);