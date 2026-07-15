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

app.use(express.urlencoded({
  extended: true
}));


// ==========================
// ROUTES
// ==========================

app.use(
  "/api/cache",
  telegramRoutes
);


app.get("/test", (req, res) => {
  res.json({
    ok: true
  });
});



const PORT = process.env.PORT || 5000;

const server = http.createServer(app);



// ==========================
// START SERVER
// ==========================

const startServer = async () => {

  try {

    // 1- MongoDB
    await connectDB();

    console.log("✅ Mongo Connected");


    // 2- Start Server
    server.listen(PORT, () => {
      console.log(
        `🚀 Server running on ${PORT}`
      );
    });


    // 3- Telegram (background)
    startLiveMessages()
      .then(() => {
        console.log(
          "🔥 Telegram listener started"
        );
      })
      .catch((err) => {
        console.error(
          "❌ Telegram Error:",
          err.message
        );
      });


  } catch (error) {

    console.error(
      "❌ Startup Error:",
      error.message
    );

    process.exit(1);

  }

};


startServer();