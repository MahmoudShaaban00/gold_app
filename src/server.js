import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

import express from "express";
import cors from "cors";
import http from "http";

import { connectDB } from "./config/dbconn.js";
import bootstrap from "./bootstarp/bootstrap.js";

import { initSocket, getIO } from "./services/socket.js";
import { startLiveMessages } from "./services/telegram.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

bootstrap(app);

const server = http.createServer(app);

// ==========================
// SOCKET INIT
// ==========================
initSocket(server);

// ==========================
// DB
// ==========================
connectDB();

// ==========================
// START TELEGRAM
// ==========================
startLiveMessages()
  .then(() => console.log("🔥 Telegram listener started"))
  .catch((err) => console.error("Telegram error:", err));

// ==========================
// TEST EMIT (REMOVE IN PROD)
// ==========================
setInterval(() => {
  getIO().emit("goldPrice", {
    price: Math.floor(Math.random() * 3000),
    text: "TEST PRICE",
    time: new Date(),
  });
}, 3000);

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});