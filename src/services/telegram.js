import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";
import { io } from "../server.js";

export const startTelegram = async () => {
  const apiId = Number(process.env.API_ID);
  const apiHash = process.env.API_HASH;

  const client = new TelegramClient(
    new StringSession(""),
    apiId,
    apiHash,
    {
      connectionRetries: 5,
    }
  );

  await client.start({
    phoneNumber: async () => await input.text("Phone: "),
    password: async () => await input.text("Password (if any): "),
    phoneCode: async () => await input.text("Code: "),
    onError: (err) => console.log("Telegram Error:", err),
  });

  console.log("✅ Telegram Connected");

  const channel = await client.getEntity("goldratepric2020");

  console.log("📡 Connected to:", channel.title);

  let lastMessageId = 0;

  // أول مرة نجيب آخر رسالة فقط
  const firstMessages = await client.getMessages(channel, {
    limit: 1,
  });

  if (firstMessages.length > 0) {
    lastMessageId = firstMessages[0].id;
  }

  console.log("🚀 Start Listening For New Prices...");

  setInterval(async () => {
    try {
      const messages = await client.getMessages(channel, {
        limit: 1,
      });

      if (!messages.length) return;

      const msg = messages[0];

      // لو نفس الرسالة القديمة
      if (msg.id === lastMessageId) return;

      lastMessageId = msg.id;

      const text = msg.message || "";

      console.log("\n📩 NEW MESSAGE:");
      console.log(text);

      // استخراج السعر
      const match = text.match(/(\d+\.\d+)/);

      if (!match) return;

      const price = Number(match[1]);

      console.log("💰 GOLD PRICE:", price);

      // إرسال للفرونت
      io.emit("goldPrice", {
        price,
        text,
        messageId: msg.id,
        time: new Date(),
      });

      console.log("📤 Sent To Frontend");
    } catch (err) {
      console.error("Telegram Polling Error:", err.message);
    }
  }, 1000); // كل ثانية

  return client;
};