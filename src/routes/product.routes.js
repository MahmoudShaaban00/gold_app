import { Router } from "express";
import { createProduct, getProducts,getProductById,deleteProduct,} from "../controllers/product.js";

import { upload } from "../middlewares/upload.js";
import { authMiddleware , adminMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
console.log("Product Routes Loaded");

router.post("/",authMiddleware, adminMiddleware, upload.single("image"), createProduct);
router.get("/", authMiddleware, adminMiddleware, getProducts);

router.get("/:id", authMiddleware, adminMiddleware, getProductById);

router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;