import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    otp: String,

    otpExpire: Date,
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);