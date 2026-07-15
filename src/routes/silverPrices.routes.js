import { Router } from "express";
import {
  createSilverPrice,
  getSilverPrices,
  getSilverPriceById,
  deleteSilverPrice,
  updateSilverPrice
} from "../controllers/silverPrices.js";


const router = Router();

router.post("/",  createSilverPrice);
router.get("/",  getSilverPrices);
router.get("/:id",  getSilverPriceById);
router.delete("/:id", deleteSilverPrice);
router.put("/:id", updateSilverPrice);


export default router;