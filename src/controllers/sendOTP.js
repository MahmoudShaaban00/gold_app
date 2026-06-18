import { User } from "../models/user.js";
import { sendSMS } from "../services/sms.js";

export const sendOtp = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({ name, phone });
    }

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendSMS(phone, `Your OTP code is: ${otp}`);

    res.json({
      success: true,
      message: "OTP sent via AWS SNS",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};