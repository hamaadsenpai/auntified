import { DEFAULT_CURRENCY } from "@/constants/currencies";

/** ISO 3166 region → currency, for every country in CURRENCIES. */
const BY_REGION: Record<string, string> = {
  SG: "SGD", MY: "MYR", ID: "IDR", TH: "THB", PH: "PHP", VN: "VND", BN: "BND", KH: "KHR", LA: "LAK", MM: "MMK",
  IN: "INR", LK: "LKR", PK: "PKR", BD: "BDT", NP: "NPR", MV: "MVR", BT: "BTN",
  JP: "JPY", KR: "KRW", CN: "CNY", HK: "HKD", TW: "TWD", MO: "MOP", MN: "MNT",
  AU: "AUD", NZ: "NZD", FJ: "FJD", PG: "PGK", SB: "SBD", VU: "VUV", WS: "WST", TO: "TOP", PF: "XPF", NC: "XPF", WF: "XPF",
};

/** The obvious IANA zone(s) per currency. Australia/* is matched by prefix. */
const BY_TIME_ZONE: Record<string, string> = {
  "Asia/Singapore": "SGD", "Asia/Kuala_Lumpur": "MYR", "Asia/Kuching": "MYR", "Asia/Jakarta": "IDR", "Asia/Makassar": "IDR",
  "Asia/Bangkok": "THB", "Asia/Manila": "PHP", "Asia/Ho_Chi_Minh": "VND", "Asia/Saigon": "VND", "Asia/Brunei": "BND",
  "Asia/Phnom_Penh": "KHR", "Asia/Vientiane": "LAK", "Asia/Yangon": "MMK", "Asia/Rangoon": "MMK",
  "Asia/Kolkata": "INR", "Asia/Calcutta": "INR", "Asia/Colombo": "LKR", "Asia/Karachi": "PKR", "Asia/Dhaka": "BDT",
  "Asia/Kathmandu": "NPR", "Asia/Katmandu": "NPR", "Indian/Maldives": "MVR", "Asia/Thimphu": "BTN",
  "Asia/Tokyo": "JPY", "Asia/Seoul": "KRW", "Asia/Shanghai": "CNY", "Asia/Hong_Kong": "HKD", "Asia/Taipei": "TWD",
  "Asia/Macau": "MOP", "Asia/Ulaanbaatar": "MNT",
  "Pacific/Auckland": "NZD", "Pacific/Fiji": "FJD", "Pacific/Port_Moresby": "PGK", "Pacific/Guadalcanal": "SBD",
  "Pacific/Efate": "VUV", "Pacific/Apia": "WST", "Pacific/Tongatapu": "TOP", "Pacific/Tahiti": "XPF", "Pacific/Noumea": "XPF",
};

function fromLanguages() {
  for (const tag of navigator.languages ?? []) {
    try {
      const region = new Intl.Locale(tag).maximize().region;
      if (region && BY_REGION[region]) return BY_REGION[region];
    } catch {
      // Malformed tag: try the next one.
    }
  }
  return null;
}

function fromTimeZone() {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return BY_TIME_ZONE[zone] ?? (zone.startsWith("Australia/") ? "AUD" : null);
  } catch {
    return null;
  }
}

/** Best guess at the user's currency from browser language, then time zone. Falls back to DEFAULT_CURRENCY. */
export function guessCurrency(): string {
  if (typeof navigator === "undefined") return DEFAULT_CURRENCY;
  return fromLanguages() ?? fromTimeZone() ?? DEFAULT_CURRENCY;
}
