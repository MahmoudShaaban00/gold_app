import { Router } from "express";
import { createProduct, getProducts,getProductById,deleteProduct,updateProduct} from "../controllers/product.js";

import { upload } from "../middlewares/upload.js";

import {authMiddleware , adminMiddleware} from  "../middlewares/auth.middleware.js"

const router = Router();
console.log("Product Routes Loaded");

router.post("/",authMiddleware, adminMiddleware, upload.single("image"), createProduct);
router.get("/",authMiddleware, getProducts);

router.get("/:id", authMiddleware, getProductById);

router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), updateProduct);

export default router;