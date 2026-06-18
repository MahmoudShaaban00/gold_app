import authRoutes from "../routes/auth.routes.js";
import OtpRoutes from "../routes/OTP.routes.js";

export default (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/otp", OtpRoutes);
}