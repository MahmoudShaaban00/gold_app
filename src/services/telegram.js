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

  if (!client) {

    client = new TelegramClient(
      new StringSession(""),
      Number(process.env.API_ID),
      process.env.API_HASH,
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
      otp:{
        phoneCodeHash: result.phoneCodeHash,
        expiresAt:new Date(Date.now()+5*60*1000)
      }
    },
    {
      upsert:true,
      new:true
    }
  );


  return {
    success:true,
    message:"Code sent successfully"
  };
};



// ==========================
// VERIFY CODE
// ==========================
export const verifyTelegramCode = async (
  phone,
  code
)=>{


  const tg = await getClient();


  const user = await User.findOne({
    phone
  });


  if(!user?.otp?.phoneCodeHash){
    throw new Error("OTP not found");
  }



  await tg.invoke(
    new Api.auth.SignIn({
      phoneNumber:phone,
      phoneCodeHash:user.otp.phoneCodeHash,
      phoneCode:code
    })
  );



  const session =
    tg.session.save();



  await User.updateOne(
    {
      phone
    },
    {
      telegramSession:session,
      $unset:{
        otp:1
      }
    }
  );



  return {
    success:true,
    session
  };

};





// ==========================
// START TELEGRAM LISTENER
// ==========================
export const startLiveMessages = async () => {

  try {


    const user = await User.findOne({
      telegramSession:{
        $exists:true,
        $ne:""
      }
    });



    if(!user){
      throw new Error(
        "Telegram session not found"
      );
    }



    const tg = new TelegramClient(

      new StringSession(
        user.telegramSession
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