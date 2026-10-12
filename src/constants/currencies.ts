export type CurrencyRegion = "Southeast Asia" | "South Asia" | "East Asia" | "Oceania";

export type Currency = {
  code: string;
  name: string;
  country: string;
  region: CurrencyRegion;
  /** Written before the number unless `after` is set. Include any space the symbol needs. */
  symbol: string;
  after?: boolean;
  /** Decimals people actually use day to day, which is not always the ISO 4217 minor unit. */
  decimals: 0 | 2;
  /** Lakh/crore digit grouping (1,00,000). */
  lakh?: boolean;
  /** Fixed demo rate: units of this currency per 1 SGD. Not live. */
  rate: number;
};

export const DEFAULT_CURRENCY = "SGD";

export const CURRENCY_REGIONS: CurrencyRegion[] = ["Southeast Asia", "South Asia", "East Asia", "Oceania"];

export const CURRENCIES: Currency[] = [
  { code: "SGD", name: "Singapore dollar", country: "Singapore", region: "Southeast Asia", symbol: "S$", decimals: 2, rate: 1 },
  { code: "MYR", name: "Malaysian ringgit", country: "Malaysia", region: "Southeast Asia", symbol: "RM", decimals: 2, rate: 3.3 },
  { code: "IDR", name: "Indonesian rupiah", country: "Indonesia", region: "Southeast Asia", symbol: "Rp", decimals: 0, rate: 12600 },
  { code: "THB", name: "Thai baht", country: "Thailand", region: "Southeast Asia", symbol: "฿", decimals: 2, rate: 25 },
  { code: "PHP", name: "Philippine peso", country: "Philippines", region: "Southeast Asia", symbol: "₱", decimals: 2, rate: 44 },
  { code: "VND", name: "Vietnamese dong", country: "Vietnam", region: "Southeast Asia", symbol: "₫", after: true, decimals: 0, rate: 19800 },
  { code: "BND", name: "Brunei dollar", country: "Brunei", region: "Southeast Asia", symbol: "B$", decimals: 2, rate: 1 },
  { code: "KHR", name: "Cambodian riel", country: "Cambodia", region: "Southeast Asia", symbol: "៛", decimals: 0, rate: 3100 },
  { code: "LAK", name: "Lao kip", country: "Laos", region: "Southeast Asia", symbol: "₭", decimals: 0, rate: 16500 },
  { code: "MMK", name: "Myanmar kyat", country: "Myanmar", region: "Southeast Asia", symbol: "K", decimals: 0, rate: 1620 },

  { code: "INR", name: "Indian rupee", country: "India", region: "South Asia", symbol: "₹", decimals: 2, lakh: true, rate: 66 },
  { code: "LKR", name: "Sri Lankan rupee", country: "Sri Lanka", region: "South Asia", symbol: "Rs ", decimals: 2, rate: 232 },
  { code: "PKR", name: "Pakistani rupee", country: "Pakistan", region: "South Asia", symbol: "Rs ", decimals: 2, lakh: true, rate: 217 },
  { code: "BDT", name: "Bangladeshi taka", country: "Bangladesh", region: "South Asia", symbol: "৳", decimals: 2, lakh: true, rate: 94 },
  { code: "NPR", name: "Nepalese rupee", country: "Nepal", region: "South Asia", symbol: "Rs ", decimals: 2, lakh: true, rate: 106 },
  { code: "MVR", name: "Maldivian rufiyaa", country: "Maldives", region: "South Asia", symbol: "Rf ", decimals: 2, rate: 11.9 },
  { code: "BTN", name: "Bhutanese ngultrum", country: "Bhutan", region: "South Asia", symbol: "Nu. ", decimals: 2, lakh: true, rate: 66 },

  { code: "JPY", name: "Japanese yen", country: "Japan", region: "East Asia", symbol: "¥", decimals: 0, rate: 115 },
  { code: "KRW", name: "South Korean won", country: "South Korea", region: "East Asia", symbol: "₩", decimals: 0, rate: 1070 },
  { code: "CNY", name: "Chinese yuan", country: "China", region: "East Asia", symbol: "¥", decimals: 2, rate: 5.55 },
  { code: "HKD", name: "Hong Kong dollar", country: "Hong Kong", region: "East Asia", symbol: "HK$", decimals: 2, rate: 6.05 },
  { code: "TWD", name: "New Taiwan dollar", country: "Taiwan", region: "East Asia", symbol: "NT$", decimals: 0, rate: 23.5 },
  { code: "MOP", name: "Macanese pataca", country: "Macau", region: "East Asia", symbol: "MOP$", decimals: 2, rate: 6.2 },
  { code: "MNT", name: "Mongolian tögrög", country: "Mongolia", region: "East Asia", symbol: "₮", decimals: 0, rate: 2650 },

  { code: "AUD", name: "Australian dollar", country: "Australia", region: "Oceania", symbol: "A$", decimals: 2, rate: 1.18 },
  { code: "NZD", name: "New Zealand dollar", country: "New Zealand", region: "Oceania", symbol: "NZ$", decimals: 2, rate: 1.3 },
  { code: "FJD", name: "Fijian dollar", country: "Fiji", region: "Oceania", symbol: "FJ$", decimals: 2, rate: 1.74 },
  { code: "PGK", name: "Papua New Guinean kina", country: "Papua New Guinea", region: "Oceania", symbol: "K", decimals: 2, rate: 3.1 },
  { code: "SBD", name: "Solomon Islands dollar", country: "Solomon Islands", region: "Oceania", symbol: "SI$", decimals: 2, rate: 6.5 },
  { code: "VUV", name: "Vanuatu vatu", country: "Vanuatu", region: "Oceania", symbol: " VT", after: true, decimals: 0, rate: 92 },
  { code: "WST", name: "Samoan tālā", country: "Samoa", region: "Oceania", symbol: "WS$", decimals: 2, rate: 2.1 },
  { code: "TOP", name: "Tongan paʻanga", country: "Tonga", region: "Oceania", symbol: "T$", decimals: 2, rate: 1.83 },
  { code: "XPF", name: "CFP franc", country: "French Polynesia, New Caledonia", region: "Oceania", symbol: " F", after: true, decimals: 0, rate: 82 },
];

const BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

export function getCurrency(code: string): Currency {
  return BY_CODE.get(code) ?? BY_CODE.get(DEFAULT_CURRENCY)!;
}

export function isCurrencyCode(code: unknown): code is string {
  return typeof code === "string" && BY_CODE.has(code);
}
