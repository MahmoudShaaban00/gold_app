import { Router } from "express";
import {
  createSilverPrice,
  getSilverPrices,
} from "../controllers/silverPrices.js";

const router = Router();

router.post("/", createSilverPrice);
router.get("/", getSilverPrices);

export default router;