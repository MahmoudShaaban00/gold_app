import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

import fs from "fs";

import { TelegramCache } from "../models/TelegramCache.js";



// ==========================
// DEDICATED APP SESSION
// ==========================
// The price-feed client authenticates with ONE session owned by the
// application, never with a customer's session.
//
// Resolution order:
//   1) process.env.TELEGRAM_SESSION
//   2) the file named by process.env.TELEGRAM_SESSION_FILE
//      (a KEY=VALUE file holding TELEGRAM_SESSION=...)
//
// The value is never logged. If it cannot be resolved this throws -
// it must NOT fall back to User.telegramSession.
const getAppSession = () => {

  const direct = process.env.TELEGRAM_SESSION;

  if (direct && direct.trim()) {
    return direct.trim();
  }

  const file = process.env.TELEGRAM_SESSION_FILE;

  if (!file) {
    throw new Error(
      "Dedicated Telegram session not configured: set TELEGRAM_SESSION or TELEGRAM_SESSION_FILE"
    );
  }

  if (!fs.existsSync(file)) {
    throw new Error(
      "Dedicated Telegram session file not found at TELEGRAM_SESSION_FILE"
    );
  }

  let contents;

  try {
    contents = fs.readFileSync(file, "utf8");
  } catch (error) {
    throw new Error(
      "Dedicated Telegram session file could not be read: " + error.code
    );
  }

  const match = contents.match(
    /^\s*TELEGRAM_SESSION\s*=\s*(.+)\s*$/m
  );

  const value = match && match[1] ? match[1].trim() : "";

  if (!value) {
    throw new Error(
      "Dedicated Telegram session file does not contain a TELEGRAM_SESSION value"
    );
  }

  return value;
};


// ==========================
// START TELEGRAM LISTENER
// ==========================
export const startLiveMessages = async () => {

  try {


    // Dedicated application session - NOT a customer's session.
    // getAppSession() throws if it cannot be resolved; there is
    // deliberately no fallback to User.telegramSession.
    const appSession = getAppSession();



    const tg = new TelegramClient(

      new StringSession(
        appSession
      ),

      Number(process.env.API_ID),

      process.env.API_HASH,

      {
        connectionRetries:5
      }

    );



    await tg.connect();



    const authorized =
      await tg.isUserAuthorized();



    if(!authorized){

      throw new Error(
        "Telegram session expired"
      );

    }



    const me =
      await tg.getMe();



    console.log(
      "👤 Telegram User:",
      {
        id:me.id,
        firstName:me.firstName
      }
    );



    const channel =
      await tg.getEntity(
        process.env.CHANNEL_USERNAME
      );



    console.log(
      "📢 Channel:",
      channel.title
    );



    let lastMessageId = 0;



    setInterval(async()=>{


      try{


        const messages =
          await tg.getMessages(
            channel,
            {
              limit:1
            }
          );



        if(!messages.length)
          return;



        const msg =
          messages[0];



        if(msg.id === lastMessageId)
          return;



        lastMessageId = msg.id;



        const text =
          msg.message?.trim() || "";



        console.log(
          "📩 Telegram Message:",
          text
        );



        // skip telegram links
        if(
          /https?:\/\/t\.me\/\S+/i.test(text)
        ){

          console.log(
            "🚫 Telegram link ignored"
          );

          return;
        }



        const match =
          text.match(
            /(?:♦️|🔹)\s*(\d+(?:\.\d+)?)/
          );



        if(!match){

          console.log(
            "❌ No price found"
          );

          return;
        }



        const price =
          Number(match[1]);



        await TelegramCache.findOneAndUpdate(

          {},

          {
            lastMessageId:msg.id,
            lastMessage:text,
            lastPrice:price,
            lastDate:new Date()
          },

          {
            upsert:true,
            new:true
          }

        );



        console.log(
          "✅ Gold Price Updated:",
          {
            id:msg.id,
            price
          }
        );


      }
      catch(error){

        console.log(
          "Polling Error:",
          error.message
        );

      }


    },5000);



    console.log(
      "🔥 Telegram polling started (5 seconds)"
    );



    return tg;


  }
  catch(error){


    console.log(
      "Telegram Listener Error:",
      error.message
    );


    throw error;

  }

};