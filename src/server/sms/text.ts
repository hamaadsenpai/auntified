import "server-only";

const PREVIEW_LENGTH = 160;

// Links and bare domains, including the shorteners and cheap TLDs scam texts favour.
const LINK = /https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|lk|net|org|info|xyz|top|link|site|online|app|ly|me|co|io|cc|click|shop|live|vip)\b/i;
// A phone number to call or WhatsApp.
const PHONE = /\+?\d[\d\s-]{7,}\d/;
// Money, credentials, threats, prizes and pressure: what a scam has to talk about to work.
const RISKY_WORDS =
  /\b(?:otp|pin|password|passcode|verify|verification|account|bank|card|blocked|suspend\w*|locked|deactivat\w*|prize|winner|won|lottery|reward|gift|refund|claim|parcel|delivery|customs|courier|police|cid|court|arrest\w*|fine|tax|urgent\w*|immediately|loan|invest\w*|crypto|job|earn|salary|telegram|whatsapp|click|link|pay|payment|transfer|deposit|rs\.?|lkr|usd|\$)\b/i;

/**
 * Cheap pre-check before spending a Gemini call: a text with no link, no phone number and no
 * money or credential talk ("On my way!") can't be asking the user to do anything risky.
 */
export function worthScanning(text: string) {
  return LINK.test(text) || PHONE.test(text) || RISKY_WORDS.test(text);
}

/**
 * The start of the text for the history list. Card and account numbers keep their last 4 digits;
 * standalone 4 to 8 digit codes (OTPs, PINs) are hidden. Amounts with separators ("1,000", "500.00") stay.
 */
export function maskedPreview(text: string) {
  const masked = text
    .replace(/\d{9,19}/g, (n) => `••••${n.slice(-4)}`)
    // A "." or "," only counts as part of the number when a digit follows: "482913." is still a code.
    .replace(/(?<![\d.,•])\d{4,8}(?!\d|[.,]\d)/g, "••••");
  return masked.length > PREVIEW_LENGTH ? `${masked.slice(0, PREVIEW_LENGTH - 1).trimEnd()}…` : masked;
}
