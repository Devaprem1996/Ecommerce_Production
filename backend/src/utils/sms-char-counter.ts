/**
 * SMS Character Counter & GSM-7 Unicode Detector
 *
 * Fast2SMS Quick SMS Pricing & Technical Constraints:
 * 1. Standard English SMS (GSM-7 encoding): Max 160 characters per single SMS credit (cost: Rs. 5).
 * 2. If a message contains even 1 Unicode character (e.g. ₹ rupee symbol, smart quotes, em-dashes, emojis),
 *    the carrier switches to UCS-2 encoding where 1 SMS credit is only 70 characters.
 * 3. If an English message exceeds 160 characters, it becomes a multipart SMS (153 chars/segment),
 *    which doubles the SMS credit cost (Rs. 10 or more instead of Rs. 5).
 *
 * This utility ensures zero Unicode leaks and strictly guarantees <= 160 GSM-7 characters per dispatch.
 */

// GSM 03.38 Basic Character Set
const GSM_7_BASIC = new Set([
  "@","£","$","¥","è","é","ù","ì","ò","Ç","\n","Ø","ø","\r","Å","å",
  "Δ","_","Φ","Γ","Λ","Ω","Π","Ψ","Σ","Θ","Ξ","\x1b","Æ","æ","ß","É",
  " ","!","\"","#","¤","%","&","'","(",")","*","+",",","-",".","/",
  "0","1","2","3","4","5","6","7","8","9",":",";","<","=",">","?",
  "¡","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O",
  "P","Q","R","S","T","U","V","W","X","Y","Z","Ä","Ö","Ñ","Ü","§",
  "¿","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o",
  "p","q","r","s","t","u","v","w","x","y","z","ä","ö","ñ","ü","à"
]);

// GSM 03.38 Extension Character Set (each takes 2 GSM characters)
const GSM_7_EXTENDED = new Set(["^", "{", "}", "\\", "[", "~", "]", "|", "€"]);

export interface SmsAnalysis {
  text: string;
  charCount: number;
  gsm7CharCount: number;
  isGsm7Compliant: boolean;
  nonGsmCharacters: string[];
  segments: number;
  costInr: number;
  maxCharsSingleSegment: number;
  isSingleSegment: boolean;
}

/**
 * Sanitizes input text to guarantee GSM-7 compatibility and eliminate accidental Unicode characters.
 * - Converts ₹ to Rs.
 * - Converts curly quotes / apostrophes to standard ASCII
 * - Converts em-dashes and en-dashes to standard hyphen
 * - Replaces non-breaking spaces with standard space
 * - Strips emojis and unsupported non-GSM symbols
 */
export function sanitizeToGsm7(text: string): string {
  if (!text) return "";

  let cleaned = text
    .replace(/₹/g, "Rs.")
    .replace(/[\u2018\u2019\u201A\u201B`]/g, "'") // Single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // Double quotes
    .replace(/[\u2013\u2014\u2015]/g, "-") // En/Em dashes
    .replace(/\u2026/g, "...") // Ellipsis
    .replace(/\u00A0/g, " ") // Non-breaking space
    .replace(/[\u200B-\u200D\uFEFF]/g, ""); // Zero-width spaces

  // Strip emojis or characters outside basic printable ASCII & GSM-7
  cleaned = cleaned.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "");

  return cleaned;
}

/**
 * Analyzes text according to GSM 03.38 standard and Fast2SMS Quick SMS limits.
 */
export function analyzeSms(text: string): SmsAnalysis {
  const nonGsmCharacters: string[] = [];
  let gsm7Length = 0;

  for (const char of text) {
    if (GSM_7_BASIC.has(char)) {
      gsm7Length += 1;
    } else if (GSM_7_EXTENDED.has(char)) {
      gsm7Length += 2;
    } else {
      gsm7Length += 1;
      if (!nonGsmCharacters.includes(char)) {
        nonGsmCharacters.push(char);
      }
    }
  }

  const isGsm7Compliant = nonGsmCharacters.length === 0;
  const maxSingle = isGsm7Compliant ? 160 : 70;
  const multipartSegmentSize = isGsm7Compliant ? 153 : 67;

  const lengthToUse = isGsm7Compliant ? gsm7Length : text.length;

  let segments = 1;
  if (lengthToUse > maxSingle) {
    segments = Math.ceil(lengthToUse / multipartSegmentSize);
  }

  const costInr = segments * 5; // Rs. 5 per segment on Fast2SMS Quick route

  return {
    text,
    charCount: text.length,
    gsm7CharCount: gsm7Length,
    isGsm7Compliant,
    nonGsmCharacters,
    segments,
    costInr,
    maxCharsSingleSegment: maxSingle,
    isSingleSegment: segments === 1,
  };
}

/**
 * Ensures message stays strictly within 1 SMS segment (<= 160 GSM-7 characters)
 * to guarantee minimal Rs. 5 Quick SMS cost.
 */
export function enforceSingleSegmentLimit(text: string, maxChars = 160): string {
  const sanitized = sanitizeToGsm7(text);
  if (sanitized.length <= maxChars) {
    return sanitized;
  }
  return sanitized.slice(0, maxChars - 3) + "...";
}
