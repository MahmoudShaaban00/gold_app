import { Router } from "express";
import {createGoldPrice, getGoldPrice,} from "../controllers/goldprices.js";

const router = Router();

router.post("/", createGoldPrice);
router.get("/", getGoldPrice);

export default router;