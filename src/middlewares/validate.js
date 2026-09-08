/**
 * Request validation for the authentication routes.
 *
 * Mounted at route level so it runs BEFORE the controller function is
 * entered. On failure it responds 400 and does not call next(), so
 * User.findOne() and User.create() are never reached and a malformed
 * request cannot create an account.
 *
 * This stage deliberately does NOT canonicalize or rewrite the phone
 * value: req.body is passed through untouched so that whatever format
 * existing users are already stored in keeps matching. Normalising
 * stored numbers is a separate, migration-shaped change.
 */

// Egyptian mobile number.
//
//   prefix   +20 | 0020 | 20 | 0        (REQUIRED - see note below)
//   operator 10 Vodafone, 11 Etisalat, 12 Orange, 15 WE
//   subscriber 8 digits
//
// The prefix is mandatory on purpose. With an optional prefix the
// pattern also matches a bare 10-digit string such as "1234567890"
// (parsed as 1 + 2 + eight digits), which is exactly the junk input this
// validation exists to reject.
const EGYPTIAN_MOBILE = /^(?:\+20|0020|20|0)1[0125]\d{8}$/;

// Separators a human may type inside a phone number. Removed for the
// format check only - the value stored and queried stays the original.
const PHONE_SEPARATORS = /[\s\-().]/g;

const NAME_MAX_LENGTH = 100;

const reject = (res, message) =>
  res.status(400).json({
    success: false,
    message,
  });

/**
 * Shared name + phone body check. Used by signin and by account deletion:
 * both accept exactly the same two fields under the same rules, so they share
 * one implementation rather than drifting apart.
 */
const validateNameAndPhone = (req, res, next) => {
  // req.body is undefined when no JSON body was sent at all.
  const body = req.body ?? {};

  const { name, phone } = body;

  // ------------------------------------------------
  // PRESENCE
  // ------------------------------------------------
  // Message preserved from the previous in-controller check so existing
  // clients see no change for this case.
  if (name === undefined || phone === undefined || name === null || phone === null) {
    return reject(res, "Name and phone are required");
  }

  // ------------------------------------------------
  // TYPE
  // ------------------------------------------------
  // This is what rejects `phone: 1234567890` sent as a JSON number.
  // Without it Mongoose silently casts the number to a string and
  // persists a junk account.
  if (typeof name !== "string" || typeof phone !== "string") {
    return reject(res, "Name and phone must be strings");
  }

  // ------------------------------------------------
  // NAME
  // ------------------------------------------------
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return reject(res, "Name and phone are required");
  }

  if (trimmedName.length > NAME_MAX_LENGTH) {
    return reject(res, "Name is too long");
  }

  // ------------------------------------------------
  // PHONE
  // ------------------------------------------------
  const trimmedPhone = phone.trim();

  if (trimmedPhone.length === 0) {
    return reject(res, "Name and phone are required");
  }

  // Check the format against a separator-free copy so a number typed as
  // "+20 102 707 0200" is still accepted. The original value continues
  // on to the controller unchanged.
  const comparablePhone = trimmedPhone.replace(PHONE_SEPARATORS, "");

  if (!EGYPTIAN_MOBILE.test(comparablePhone)) {
    return reject(res, "Invalid Egyptian mobile number");
  }

  return next();
};

export const validateSignin = validateNameAndPhone;

// DELETE /api/auth/account carries the same { name, phone } body, so a
// malformed request is rejected here before the controller loads the
// authenticated account.
export const validateAccountDeletion = validateNameAndPhone;

export default validateSignin;
