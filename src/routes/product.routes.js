import { Router } from "express";
import { createProduct, getProducts,getProductById,deleteProduct,} from "../controllers/product.js";

import { upload } from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
console.log("Product Routes Loaded");

router.post("/", authMiddleware, upload.single("image"), createProduct);
router.get("/", authMiddleware, getProducts);

router.get("/:id", authMiddleware, getProductById);

router.delete("/:id", authMiddleware, deleteProduct);

export default router;