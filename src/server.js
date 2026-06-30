import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

import express from "express";
import cors from "cors";
import http from "http";

import { connectDB } from "./config/dbconn.js";
import telegramRoutes from "./routes/telegramcache.routes.js";
import { startLiveMessages } from "./services/telegram.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
// DB CONNECT
// ==========================
connectDB();

// ==========================
// ROUTES (IMPORTANT)
// ==========================
app.use("/api/cache", telegramRoutes);

// ==========================
// TEST ROUTE
// ==========================
app.get("/test", (req, res) => {
  res.json({ ok: true });
});

// ==========================
// SERVER
// ==========================
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, async () => {
  console.log(`🚀 Server running on ${PORT}`);

  try {
    await startLiveMessages();
    console.log("🔥 Telegram listener started");
  } catch (err) {
    console.error("Telegram error:", err);
  }
});