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

import { securityHeaders } from "./middlewares/securityHeaders.js";
import { sanitizeRequest } from "./middlewares/sanitize.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";


const app = express();


// ==========================
// SECURITY HEADERS
// ==========================
// Must run before the routes so every response carries the headers,
// including responses from the 404 and error handlers below.

app.disable("x-powered-by");

app.use(securityHeaders);


// ==========================
// CORS
// ==========================
// Browser origins allowed to READ responses from this API.
// Anything not listed is refused the Access-Control-Allow-Origin header,
// which is what makes the browser block the response.

const ALLOWED_ORIGINS = [
  "https://dahbelarby.com",
  "https://www.dahbelarby.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header at all: native apps, curl, server-to-server
      // calls and health checks. CORS does not apply to these and they
      // must keep working, so they are allowed through.
      if (!origin) {
        return callback(null, true);
      }

      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      // Unknown browser origin: refuse by returning false rather than an
      // Error. false omits Access-Control-Allow-Origin, which is exactly
      // what the browser enforces on. Passing an Error instead would be
      // handed to the global error handler and turn every stray probe
      // and preflight into a logged 500.
      return callback(null, false);
    },

    // credentials is deliberately NOT enabled: authentication is
    // Bearer-token only, there are no cookies or sessions to carry.
  })
);

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));


// ==========================
// MONGO OPERATOR GUARD
// ==========================
// After the body parsers, so req.body is populated, and before any
// route can pass user input to Mongoose.

app.use(sanitizeRequest);




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
// 404 + ERROR HANDLING
// ==========================
// Mounted last: notFound catches every unmatched route, errorHandler
// must be the final middleware for Express to treat it as one.

app.use(notFound);

app.use(errorHandler);




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