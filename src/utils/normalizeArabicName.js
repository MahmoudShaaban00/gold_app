/**
 * Normalises an Arabic (or Latin) personal name for COMPARISON ONLY.
 *
 * The value stored in MongoDB is never changed - this is applied to both
 * sides of an equality check so the same human name typed with different
 * but equivalent Arabic characters still matches.
 *
 * Order matters:
 *   1. Unicode NFC, so decomposed forms compose before folding
 *   2. drop invisible / zero-width / bidi control characters
 *   3. drop tatweel (kashida) - decorative elongation, carries no meaning
 *   4. drop tashkeel (diacritics)
 *   5. fold equivalent letter shapes
 *   6. collapse every run of whitespace to one space, then trim
 */

const INVISIBLE = /[\u200B-\u200F\u2060\u00AD\u061C\uFEFF]/g;
const TATWEEL = /\u0640/g;
const TASHKEEL = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const WHITESPACE = /\s+/g;

const LETTER_FOLD = {
  "\u0629": "\u0647", // ta marbuta -> ha
  "\u0649": "\u064A", // alef maksura -> yeh
  "\u0623": "\u0627", // alef hamza above -> alef
  "\u0625": "\u0627", // alef hamza below -> alef
  "\u0622": "\u0627", // alef madda -> alef
  "\u0671": "\u0627", // alef wasla -> alef
  "\u0624": "\u0648", // waw hamza -> waw
  "\u0626": "\u064A", // yeh hamza -> yeh
};

export const normalizeArabicName = (value) => {
  if (typeof value !== "string") return "";

  let out = value.normalize("NFC");

  out = out.replace(INVISIBLE, "");
  out = out.replace(TATWEEL, "");
  out = out.replace(TASHKEEL, "");

  out = Array.from(out, (ch) => LETTER_FOLD[ch] ?? ch).join("");

  out = out.replace(WHITESPACE, " ").trim();

  return out;
};

/**
 * True when two names refer to the same person once Arabic typing
 * variations are ignored. Case-insensitive for Latin characters.
 */
export const namesMatch = (a, b) =>
  normalizeArabicName(a).toLowerCase() === normalizeArabicName(b).toLowerCase();

export default normalizeArabicName;
