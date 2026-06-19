import authRoutes from "../routes/auth.routes.js";
import goldPriceRoutes from "../routes/goldprices.routes.js";
import categoryRoutes from "../routes/category.routes.js";
import productRoutes from "../routes/product.routes.js";
import silverPriceRoutes from "../routes/silverPrices.routes.js";
import telegramRoutes from "../routes/telegram.routes.js";

export default (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/gold-prices", goldPriceRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/silver-prices", silverPriceRoutes);
  app.use("/api/telegram", telegramRoutes);
}