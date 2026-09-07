/**
 * Reject-mode MongoDB operator guard.
 *
 * Rejects any request whose JSON body contains an object KEY that Mongo
 * would read as an operator ("$ne", "$gt", ...) or as a dotted path
 * ("a.b"). Such keys never appear in a legitimate payload for this API -
 * every controller destructures plain identifiers - so rejecting is safe
 * and is preferable to stripping: the client is told the request was bad
 * instead of silently getting a different query than it sent.
 *
 * Values are NEVER modified. This middleware only inspects and either
 * calls next() or responds 400.
 *
 * Why not express-mongo-sanitize: it assigns to req.query, which is a
 * getter-only property in Express 5, so it throws at runtime.
 * This guard only reads, which is Express 5 safe.
 *
 * Scope notes:
 *   - req.body is the real attack surface (JSON can nest objects).
 *   - req.query is inspected read-only. Express 5's default "simple"
 *     query parser cannot build nested objects, so ?a[$ne]=1 arrives as
 *     the literal key "a[$ne]"; the check is defence in depth.
 *   - req.params is not inspected: path segments are always strings and
 *     cannot carry an operator object.
 *   - multipart/form-data is parsed later by multer (route level), so
 *     req.body is empty here for those routes. multer field values are
 *     always strings, so no operator object can be built there either.
 */

// How deep to walk before giving up. A payload nested deeper than this is
// not something this API accepts, and the cap keeps a hostile deeply
// nested body from exhausting the stack.
const MAX_DEPTH = 10;

const isForbiddenKey = (key) =>
  key.startsWith("$") || key.includes(".");

/**
 * Returns the offending key, or null when the value is clean.
 */
const findForbiddenKey = (value, depth = 0) => {
  if (depth > MAX_DEPTH) return "<payload nested too deeply>";

  if (value === null || typeof value !== "object") return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findForbiddenKey(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  for (const key of Object.keys(value)) {
    if (isForbiddenKey(key)) return key;

    const found = findForbiddenKey(value[key], depth + 1);
    if (found) return found;
  }

  return null;
};

export const sanitizeRequest = (req, res, next) => {
  // Bodyless requests (GET, DELETE, multipart before multer) short-circuit.
  const offender =
    findForbiddenKey(req.body) ?? findForbiddenKey(req.query);

  if (offender) {
    return res.status(400).json({
      success: false,
      message: "Invalid request payload",
    });
  }

  return next();
};

export default sanitizeRequest;
