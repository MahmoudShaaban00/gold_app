import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import path from "path";
import { Server } from "socket.io";

import { connectDB } from "./config/dbconn.js";
import { startTelegram } from "./services/telegram.js";
import bootstrap from "./bootstarp/bootstrap.js";

dotenv.config();

const app = express();

// ✅ CORS configuration (important for production)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://goldapp-production-99bf.up.railway.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Serve uploaded images (if still using local uploads)
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// Routes
bootstrap(app);

const server = http.createServer(app);

// Socket.io
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

connectDB();

io.on("connection", (socket) => {
  console.log("Frontend Connected:", socket.id);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`Server running on ${PORT}`);

  await startTelegram();
});