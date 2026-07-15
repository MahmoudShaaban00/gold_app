import { Router } from "express";
import { createProduct, getProducts,getProductById,deleteProduct,updateProduct} from "../controllers/product.js";

import { upload } from "../middlewares/upload.js";

const router = Router();
console.log("Product Routes Loaded");

router.post("/", upload.single("image"), createProduct);
router.get("/", getProducts);

router.get("/:id", getProductById);

router.delete("/:id", deleteProduct);
router.put("/:id", upload.single("image"), updateProduct);

export default router;