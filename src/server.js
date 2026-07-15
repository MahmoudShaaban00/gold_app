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

bootstrap(app);



// ==========================
// TEST ROUTE
// ==========================

app.get("/test", (req,res)=>{
  res.json({
    ok:true
  });
});




// ==========================
// SERVER
// ==========================

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);




// ==========================
// START
// ==========================

const startServer = async()=>{

try{


await connectDB();

console.log("✅ Mongo Connected");



server.listen(PORT,()=>{

console.log(
`🚀 Server running on ${PORT}`
);

});



startLiveMessages()
.then(()=>{

console.log(
"🔥 Telegram listener started"
);

})
.catch(err=>{

console.error(
"Telegram error:",
err.message
);

});


}
catch(error){

console.error(
"Startup Error:",
error.message
);

process.exit(1);

}

};


startServer();