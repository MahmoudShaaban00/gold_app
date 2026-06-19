import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { Api } from "telegram";
import { User } from "../models/user.js";
import { getIO } from "./socket.js";

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
      $unset: { otp: 1 },
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
      telegramSession: { $exists: true, $ne: "" },
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

    console.log("✅ Telegram connected");

    const authorized = await tg.isUserAuthorized();

    console.log("Authorized:", authorized);

    if (!authorized) {
      throw new Error("Telegram session expired");
    }

    const dialogs = await tg.getDialogs();

    console.log("========== TELEGRAM CHATS ==========");

    dialogs.forEach((dialog) => {
      console.log({
        id: dialog.id.toString(),
        title: dialog.title,
      });
    });

    console.log("===================================");

    const chat = await tg.getEntity(
      process.env.CHANNEL_USERNAME
    );

    console.log("📢 Listening Chat:", {
      id: chat.id.toString(),
      title: chat.title,
    });

    // ==========================
    // GET LAST 10 MESSAGES
    // ==========================
    const oldMessages = await tg.getMessages(chat, {
      limit: 10,
    });

    const history = oldMessages
      .filter((msg) => msg.message)
      .map((msg) => ({
        id: msg.id,
        text: msg.message,
        date: msg.date,
      }));

    console.log("===== LAST 10 MESSAGES =====");

    history.forEach((msg) => {
      console.log(msg.text);
    });

    console.log("============================");

    // send old messages
    getIO().emit("telegramHistory", history);

    // extract prices from history
    history.forEach((msg) => {
      const match = msg.text.match(/(\d+(\.\d+)?)/);

      if (match) {
        getIO().emit("goldPrice", {
          price: Number(match[1]),
          text: msg.text,
          time: msg.date,
        });
      }
    });

    const { NewMessage } = await import(
      "telegram/events/index.js"
    );

    // ==========================
    // LISTEN NEW MESSAGES
    // ==========================
    tg.addEventHandler(
      async (event) => {
        try {
          const message = event.message;

          if (!message) return;

          const text = message.message;

          console.log("📩 NEW MESSAGE:");
          console.log(text);

          getIO().emit("telegramMessage", {
            id: message.id,
            text,
            date: message.date,
          });

          const match =
            text?.match(/(\d+(\.\d+)?)/);

          if (match) {
            const price = Number(match[1]);

            getIO().emit("goldPrice", {
              price,
              text,
              time: new Date(),
            });

            console.log(
              "💰 Gold Price Sent:",
              price
            );
          }
        } catch (err) {
          console.error(
            "Message Handler Error:",
            err
          );
        }
      },
      new NewMessage({
        chats: [chat.id],
      })
    );

    console.log(
      "🔥 Waiting for new messages..."
    );

    return tg;
  } catch (error) {
    console.error(
      "Telegram Listener Error:",
      error
    );
    throw error;
  }
};