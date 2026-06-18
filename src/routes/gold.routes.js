import express from "express";
import { GoldPrice } from "../models/GoldPrice.js";

const router = express.Router();

router.get("/latest", async (req, res) => {
  const latest = await GoldPrice
    .findOne()
    .sort({ createdAt: -1 });

  res.json(latest);
});

router.get("/history", async (req, res) => {
  const data = await GoldPrice
    .find()
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(data);
});

export default router;