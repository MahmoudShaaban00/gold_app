import { Router } from "express";
import {createGoldPrice, getGoldPrice,deleteGoldPrice, getGoldPriceById} from "../controllers/goldprices.js";

const router = Router();

router.post("/",  createGoldPrice);
router.get("/",  getGoldPrice);
router.get("/:id",  getGoldPriceById);
router.delete("/:id", deleteGoldPrice);

export default router;