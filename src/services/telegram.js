import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { Api } from "telegram";
import { User } from "../models/user.js";
import { getIO } from "./socket.js";

let client = null;

// ==========================
// INIT CLIENT (for login only)
// ==========================
const getClient = async () => {
  const apiId = Number(process.env.API_ID);
  const apiHash = process.env.API_HASH;

  if (!client) {
    client = new TelegramClient(
      new StringSession(""),
      apiId,
      apiHash,
      { connectionRetries: 5 }
    );

    await client.connect();
  }

  return client;
};



// ==========================
// SEND CODE
// ==========================
export const sendTelegramCode = async (phone) => {
  const tg = await getClient();

  const result = await tg.sendCode(
    {
      apiId: Number(process.env.API_ID),
      apiHash: process.env.API_HASH,
    },
    phone
  );

  await User.findOneAndUpdate(
    { phone },
    {
      phone,
      otp: {
        phoneCodeHash: result.phoneCodeHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    },
    { upsert: true, new: true }
  );

  return {
    success: true,
    message: "Code sent",
  };
};



// ==========================
// VERIFY CODE + SAVE SESSION
// ==========================
export const verifyTelegramCode = async (phone, code) => {
  const tg = await getClient();

  const user = await User.findOne({ phone });

  if (!user?.otp?.phoneCodeHash) {
    throw new Error("OTP not found");
  }

  if (user.otp.expiresAt < new Date()) {
    throw new Error("OTP expired");
  }

  // LOGIN
  await tg.invoke(
    new Api.auth.SignIn({
      phoneNumber: phone,
      phoneCodeHash: user.otp.phoneCodeHash,
      phoneCode: code,
    })
  );

  // 🔥 GENERATE SESSION
  const sessionString = tg.session.save();

  // 💾 SAVE TO DB
  await User.updateOne(
    { phone },
    {
      $unset: { otp: 1 },
      telegramSession: sessionString,
    }
  );

  return {
    success: true,
    session: sessionString,
  };
};



// ==========================
// LIVE MESSAGES (REAL TIME)
// ==========================
export const startLiveMessages = async () => {
  const user = await User.findOne({ telegramSession: { $ne: null } });

  if (!user) {
    throw new Error("No Telegram session found in DB");
  }

  const tg = new TelegramClient(
    new StringSession(user.telegramSession),
    Number(process.env.API_ID),
    process.env.API_HASH,
    { connectionRetries: 5 }
  );

  await tg.connect();

  const chat = await tg.getEntity(process.env.CHANNEL_USERNAME);

  const { NewMessage } = await import("telegram/events/index.js");

  console.log("📡 Telegram listening started...");

  tg.addEventHandler(
    (event) => {
      try {
        const msg = event.message?.message;
        if (!msg) return;

        console.log("📩 Telegram:", msg);

        const match = msg.match(/(\d+(\.\d+)?)/);
        if (!match) return;

        const price = Number(match[1]);

        getIO().emit("goldPrice", {
          price,
          text: msg,
          time: new Date(),
        });
      } catch (err) {
        console.error("Telegram handler error:", err);
      }
    },
    new NewMessage({
      chats: [chat.id],
    })
  );

  console.log("🔥 Live Telegram started successfully");
};