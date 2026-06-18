import { Router } from "express";
import { createProduct, getProducts,getProductById,deleteProduct,} from "../controllers/product.js";

import { upload } from "../middlewares/upload.js";

const router = Router();
console.log("Product Routes Loaded");

router.post("/", upload.single("image"), createProduct);
router.get("/", getProducts);

router.get("/:id", getProductById);

router.delete("/:id", deleteProduct);

export default router;