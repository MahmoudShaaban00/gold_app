import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { Api } from "telegram";
import { User } from "../models/user.js";
import { TelegramCache } from "../models/TelegramCache.js";

let client = null;

// ==========================
// INIT CLIENT
// ==========================
const getClient = async () => {
  const apiId = Number(process.env.API_ID);
  const apiHash = process.env.API_HASH;

  if (!client) {
    client = new TelegramClient(
      new StringSession(""),
      apiId,
      apiHash,
      {
        connectionRetries: 5,
      }
    );

    await client.connect();

    console.log("✅ Client connected");
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
    {
      upsert: true,
      new: true,
    }
  );

  return {
    success: true,
    message: "Code sent successfully",
  };
};

// ==========================
// VERIFY CODE
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

  await tg.invoke(
    new Api.auth.SignIn({
      phoneNumber: phone,
      phoneCodeHash: user.otp.phoneCodeHash,
      phoneCode: code,
    })
  );

  const sessionString = tg.session.save();

  await User.updateOne(
    { phone },
    {
      telegramSession: sessionString,
      $unset: {
        otp: 1,
      },
    }
  );

  return {
    success: true,
    session: sessionString,
  };
};

// ==========================
// LIVE TELEGRAM MESSAGES
// ==========================
export const startLiveMessages = async () => {
  try {
    const user = await User.findOne({
      telegramSession: {
        $exists: true,
        $ne: "",
      },
    });

    if (!user) {
      throw new Error("No Telegram session found");
    }

    const tg = new TelegramClient(
      new StringSession(user.telegramSession),
      Number(process.env.API_ID),
      process.env.API_HASH,
      {
        connectionRetries: 5,
      }
    );

    await tg.connect();

    const authorized = await tg.isUserAuthorized();

    if (!authorized) {
      throw new Error("Telegram session expired");
    }

    const me = await tg.getMe();

    console.log("👤 Logged User:", {
      id: me.id,
      username: me.username,
      firstName: me.firstName,
    });

    const chat = await tg.getEntity(process.env.CHANNEL_USERNAME);

    console.log("✅ Telegram connected");

    console.log("📢 Listening Chat:", {
      id: chat.id.toString(),
      title: chat.title,
      className: chat.className,
      broadcast: chat.broadcast,
      megagroup: chat.megagroup,
    });

    const oldMessages = await tg.getMessages(chat, {
      limit: 1,
    });

    let lastMessageId =
      oldMessages.length > 0 ? oldMessages[0].id : 0;

    console.log("📌 Last Message ID:", lastMessageId);

    setInterval(async () => {
      try {
        const messages = await tg.getMessages(chat, {
          limit: 1,
        });

        if (!messages.length) return;

        const msg = messages[0];

        if (msg.id === lastMessageId) return;

        lastMessageId = msg.id;

        console.log("📩 NEW MESSAGE:");
        console.log(msg.message);

        const text = msg.message?.trim() || "";

        const match = text.match(/[♦️🔹]?\s*(\d+(?:\.\d+)?)/);

        if (!match) {
          console.log("🚫 Advertisement or non-price message ignored");
          return;
        }

        const price = parseFloat(match[1]);

        await TelegramCache.findOneAndUpdate(
          {},
          {
            lastMessageId: msg.id,
            lastMessage: msg.message,
            lastPrice: price,
            lastDate: msg.date,
          },
          {
            upsert: true,
            new: true,
          }
        );

        console.log("✅ New Gold Price:", price);

        console.log("✅ Cache Updated:", {
          lastMessageId: msg.id,
          lastPrice: price,
          lastDate: msg.date,
        });
      } catch (err) {
        console.error("Polling Error:", err.message);
      }
    }, 5000);

    console.log("🔥 Telegram polling started (5s)");

    return tg;
  } catch (err) {
    console.error("Telegram Listener Error:", err);
    throw err;
  }
};