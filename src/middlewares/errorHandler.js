/**
 * JSON 404 + global error handler.
 *
 * Both are mounted last, after every route. Together they guarantee that
 * a client always receives JSON: Express's built-in fallbacks emit an
 * HTML "Cannot GET /x" page and, for a thrown error, an HTML stack trace.
 *
 * No ODM internals, schema paths or stack traces reach the client. The
 * full error is still logged server-side so nothing is lost for
 * debugging.
 */

// ==========================
// 404
// ==========================
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

// ==========================
// ERROR HANDLER
// ==========================
// Express identifies an error handler by its four-parameter signature,
// so `next` must stay in the list even though it is not called.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // Full detail stays on the server.
  console.error("Unhandled error:", err);

  // If a response already started streaming we cannot change the status;
  // hand back to Express to close the connection.
  if (res.headersSent) {
    return next(err);
  }

  let status = 500;
  let message = "Internal server error";

  // Malformed JSON from express.json(). Without this it surfaces as a
  // generic 500 even though the client is at fault.
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    status = 400;
    message = "Malformed JSON body";
  } else if (err?.type === "entity.too.large") {
    status = 413;
    message = "Request body too large";
  } else if (err?.name === "CastError" || err?.name === "ValidationError") {
    // Mongoose. err.message names the model, the schema path and the
    // rejected value, so it is replaced rather than forwarded.
    status = 400;
    message = "Invalid request data";
  } else if (err?.code === 11000) {
    // Mongo duplicate key. err.keyValue would echo the indexed field.
    status = 409;
    message = "Resource already exists";
  } else if (err?.name === "TokenExpiredError") {
    status = 401;
    message = "Access token expired";
  } else if (err?.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid access token";
  } else if (
    // An explicit, deliberate status set by application code is trusted
    // and preserved; anything 5xx still reports the generic message.
    Number.isInteger(err?.status || err?.statusCode) &&
    (err.status || err.statusCode) >= 400 &&
    (err.status || err.statusCode) < 500
  ) {
    status = err.status || err.statusCode;
    message = typeof err.expose === "boolean" && err.expose && err.message
      ? err.message
      : "Bad request";
  }

  res.status(status).json({
    success: false,
    message,
  });
};

export default errorHandler;
