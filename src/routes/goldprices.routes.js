import { Router } from "express";
import {createGoldPrice, getGoldPrice,deleteGoldPrice} from "../controllers/goldprices.js";

const router = Router();

router.post("/", createGoldPrice);
router.get("/", getGoldPrice);
router.delete("/:id", deleteGoldPrice);

export default router;