import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/dbconn.js";
import { startTelegram } from "./services/telegram.js";
import bootstrap from "./bootstarp/bootstrap.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); // قبل routes

bootstrap(app);

const server = http.createServer(app);


export const io = new Server(server, {
  cors: {
    origin: "*",
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