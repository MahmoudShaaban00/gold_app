/**
 * Normalises an Egyptian mobile number for COMPARISON ONLY.
 *
 * The value stored in MongoDB is never rewritten - accounts are created by
 * signin with whatever format the client sent (the app sends "+20…", older
 * rows may hold "01…"). This helper reduces both sides of a check to the
 * national subscriber form so the same real number still matches however it
 * was typed:
 *
 *   +20 102 707 0200 | 00201027070200 | 201027070200 | 01027070200
 *                        -> 1027070200
 *
 * Returns "" when the value is not a recognisable Egyptian mobile number, so
 * callers must treat "" as "no match" rather than as a comparable value.
 */

// Separators a human may type inside a phone number.
const PHONE_SEPARATORS = /[\s\-().]/g;

// Optional country/trunk prefix, then operator code + 8 subscriber digits.
const EGYPTIAN_MOBILE = /^(?:0020|20|0)?(1[0125]\d{8})$/;

export const canonicalEgyptianPhone = (value) => {
  if (typeof value !== "string") return "";

  const digits = value
    .replace(PHONE_SEPARATORS, "")
    .replace(/^\+/, "");

  const match = digits.match(EGYPTIAN_MOBILE);

  return match ? match[1] : "";
};

/**
 * True when two phone strings refer to the same Egyptian mobile number.
 *
 * If the stored value is not a recognisable Egyptian number (legacy rows), it
 * falls back to an exact string comparison so such an account is still
 * verifiable by its owner rather than permanently unmatchable.
 */
export const phonesMatch = (stored, submitted) => {
  if (typeof stored !== "string" || typeof submitted !== "string") return false;

  const canonicalStored = canonicalEgyptianPhone(stored);

  if (canonicalStored === "") {
    return stored.trim() === submitted.trim() && stored.trim() !== "";
  }

  return canonicalStored === canonicalEgyptianPhone(submitted);
};

export default phonesMatch;
