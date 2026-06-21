import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    karat: {
      type: Number,
      enum: [18, 21, 24],
      required: true,
    },

    weight: {
      type: Number,
      required: true,
    },

    workmanship: {
      type: Number,
      default: 0,
    },

    cashback: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model(
  "Product",
  productSchema
);