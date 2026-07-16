import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    otp: {
      phoneCodeHash: String,
      expiresAt: Date,
    },

      telegramSession: {
    type: String,
    default: null,
  },
  

  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);